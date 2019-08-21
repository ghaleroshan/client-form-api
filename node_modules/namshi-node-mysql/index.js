/* jshint esversion: 6 */
const mysql2 = require('mysql2/promise');
let instances = {};

function DB() {
  this.pool = null;
  this.sessionConfig = null;
  this.debug = false;
}

function setSessionConfig(connection, config) {
  if(!config) {
    return;
  }

  if(this.debug) {
    console.log(`Set Session Config ${config}`);
  }

  return Promise.all(Object.entries(config).map(([key, value]) =>
    connection.query(`SET SESSION ${key} = ?`, [value])
  ));
}

function runQueryWith(query, params) {
  let connection;

  return this.getConnection().then((conn)=> {
    connection = conn;
    if (this.debug) {
      console.log('getting connection');
      console.info('QUERY AND PARAMS', query, params);
    }

    return connection.execute(query, params);
  }).then((results) => {
    connection && connection.connection && connection.connection.unprepare(query);
    connection && connection.release();
    if (this.debug) {
      console.log('ok - released connection');
    }

    return results[0];
  }).catch(err => {
    if (!connection) {
      console.error('could not establish db connection', err.message);
      throw err;
    }

    connection.connection && connection.connection.unprepare(query);
    connection.release();

    throw err;
  });
}

function flatten(params) {
  return params.reduce((acc, param) =>
    Array.isArray(param) ? [...acc, ...param] : [...acc, param],
  []);
}

/**
 * If params contain arrays, the corresponding placeholders are expanded
 * with extra placeholders to match arrays' lengths and params are flattened.
 *
 * @param  {String} query
 * @param  {Array} params
 * @return {Array}
 */
DB.prototype.prepareQuery = function(query, params) {
  if(Array.isArray(params)){
    let i = 0;
    query = query.replace(/\?/g, function (match){
      let param = params[i++];
      return Array.isArray(param) ? Array(param.length).fill('?').join(',') : '?'
    });
    params = flatten(params);
  }

  return [query, params];
}

/**
 * Format a query as a preapred statement for bulk insert.
 *
 * @param  {String} query
 * @param  {Array} values
 * @return {Array}
 */
DB.prototype.prepareBulk = function(query, values) {
  if(!Array.isArray(values) || (values[0] && !Array.isArray(values[0]))) {
    throw new Error(`Please provide an array of arrays for bulk insert like [[1,2], [1,3]]`);
  }

  let placeholders = '';

  for (let i = 0; i < values.length; i++) {
    placeholders += `(${Array(values[i].length).fill('?')})`;
    placeholders += `${(values.length - 1  != i) ? ',' : ''}`;
  }

  return [
    query.replace(`?`, placeholders),
    values.reduce((acc, cur) => acc.concat(cur), [])
  ];
}

/**
 * We are overiding the select method so that it returns the rows not the metadata
 * that is included in results[1]
 * @return {Object} Connection
 */
DB.prototype.getConnection = function () {
  return this.pool.getConnection().then((conn)=> {
    if (this.debug) {
      console.log('getting connection');
    }

    let exec = conn.execute;
    conn.select = function(query, params) {
      return exec.call(this, query, params).then((results) => {
        return results[0];
      });
    };

    if(this.sessionConfig) {
      return setSessionConfig(conn, this.sessionConfig).then(() => conn)
    }

    return conn;
  });
};

/**
 * Setup the Database connection pool for this instance
 * @param  {Object} config
 */
DB.prototype.configure = function (config) {
  if ('debug' in config) {
    this.debug = config.debug;
    delete config.debug;
  }

  if ('sessionConfig' in config) {
    this.sessionConfig = config.sessionConfig;
    delete config.sessionConfig;
  }

  this.pool = mysql2.createPool(config);
};

/**
 * Run a DB query using prepared statements. This function does not support batch
 * operations.
 * @param  {String} query
 * @param  {Object} [params]
 * @return {Promise}
 */
DB.prototype.query = function(query, params) {
  if(Array.isArray(params)){
    [query, params] = this.prepareQuery(query, params);
  }

  return runQueryWith.call(this, query, params);
}


/**
 * Run a DB query using prepared statements. This function supports batch operations
 *
 * @param  {String} query
 * @param  {Object} [params]
 * @return {Promise}
 */
DB.prototype.bulk = function(query, params) {
  [query, params] = this.prepareBulk(query, params);
  return runQueryWith.call(this, query, params);
}

/**
* Set Session wait timeout parameter to close connection if inactive
* Initiate transaction so all the subsequent queries to the db are not written
* to the database until commit is called
* @param  {String} timeout
*
* @return {object} connection
**/
DB.prototype.startTransaction = function (timeout) {
  timeout = timeout || 20;
  let connection;
  return this.getConnection().then(conn => {
    connection = conn;
    return connection.query('SET SESSION wait_timeout = ?', [timeout]);
  }).then(()=> {
    return connection.query('START TRANSACTION');
  }).then(() => {
    return connection;
  });
};

/**
 * Rollback the current transaction
 * @param  {Object} connection The connection object from startTransaction
 */
DB.prototype.rollback = function (connection) {
  if(connection){
      return connection.execute('ROLLBACK').then(()=> {
        connection.release();
      }).catch(err => {
        connection.release();

        throw err;
      });
  }
};

/**
 * Commit the current transaction
 * @param  {Object} connection The connection object from startTransaction
 */
DB.prototype.commit = function (connection) {
  return connection.execute('COMMIT').then(()=> {
    connection.release();
  }).catch(err => {
    connection.release();

    throw err;
  });
};

module.exports = function (opts) {
  if (!opts || Object.keys(opts).length <= 0) {
    throw new Error('The config object cannot be empty');
  }

  let config = JSON.parse(JSON.stringify(opts));
  let name = '_default_';

  if (config.name) {
    name = config.name;
    delete config.name;
  }

  if (!instances[name]) {
    let instance = new DB();
    instance.configure(config);
    instances[name] = instance;
  }

  return instances[name];
};
