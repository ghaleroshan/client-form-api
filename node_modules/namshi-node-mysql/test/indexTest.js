`use strict`
const assert = require('assert');
const should = require('should');
const sinon = require('sinon');

describe('node-mysql', () => {
  it('should return correct instance', (done) => {
    const defaultDb = require('../index')({host: 'mysql'});
    const namedDb = require('../index')({host: 'mysql', name: 'foo'});
    namedDb.should.equal(require('../index')({host: 'mysql', name: 'foo'}));
    namedDb.should.have.property('query').which.is.a.Function;
    namedDb.should.have.property('bulk').which.is.a.Function;
    namedDb.should.have.property('getConnection').which.is.a.Function;
    namedDb.should.have.property('startTransaction').which.is.a.Function;
    namedDb.should.have.property('commit').which.is.a.Function;
    namedDb.should.have.property('rollback').which.is.a.Function;
    defaultDb.should.equal(require('../index')({host: 'mysql'}));
    defaultDb.should.not.equal(namedDb);
    defaultDb.should.have.property('query').which.is.a.Function;

    done();
  });

  it('should throw an error if we do not pass a config object', (done) => {
    try {
      const db = require('../index')({});
    } catch (err) {
      assert.equal(err.message, 'The config object cannot be empty');
    }

    done();
  })

  it('should throw an error if the config object is empty', (done) => {
    try {
      const db = require('../index')();
    } catch (err) {
      assert.equal(err.message, 'The config object cannot be empty');
    }

    done();
  });

  it('should throw an error if array of arrays is not passed to bulk', (done) => {
    try {
      const db = require('../index')({host: 'mysql', name: 'foo'});
      db.bulk('INSERT INTO tbl_name (a,b,c) VALUES ?', []);
    } catch (err) {
      assert.equal(err.message, 'Please provide an array of arrays for bulk insert like [[1,2], [1,3]]');
    }
    done();
  });

  it('should return a prepared insert query with correct values for array of arrays for bulk insert', (done) => {
    const db = require('../index')({host: 'mysql', name: 'foo'});
    const connectionStub = {
      execute: function(query, params){
        assert.equal(query, 'INSERT INTO tbl_name (a,b,c) VALUES (?,?,?),(?,?,?)');
        assert.deepEqual(params, [1, 2, 3, 4, 5, null]);

        return [];
      },
      release: function() { },
      connection: {unprepare: function() {}}
    };
    const sandbox = sinon.sandbox.create();
    sandbox.stub(db, 'configure').callsFake(function(config) { });
    sandbox.stub(db, 'getConnection').resolves(connectionStub);
    db.bulk('INSERT INTO tbl_name (a,b,c) VALUES ?', [[1,2,3],[4,5, null]]).then(res => {
      sandbox.restore();
      done();
    }).catch(err => {
      console.log('error: ', err);
      sandbox.restore();
      assert.equal(err.message, 'should never reach here');
      done();
    });
  });

  it('should add extra placeholders in the prepared query if the corresponding param is an array', (done) => {
    const db = require('../index')({host: 'mysql', name: 'foo'});
    const connectionStub = {
      execute: function(query, params){
        assert.equal(query, 'SELECT FROM tbl_name WHERE col_name IN (?,?,?) AND col_name_1 = ? AND col_name_2 IN (?,?) AND col_name_3 = ?');
        assert.deepEqual(params, [1, 2, 3, null, 4, null, 5]);

        return [];
      },
      release: function() { },
      connection: {unprepare: function() {}}
    };
    const sandbox = sinon.sandbox.create();
    sandbox.stub(db, 'configure').callsFake(function(config) { });
    sandbox.stub(db, 'getConnection').resolves(connectionStub);
    db.query('SELECT FROM tbl_name WHERE col_name IN (?) AND col_name_1 = ? AND col_name_2 IN (?) AND col_name_3 = ?',
      [[1, 2, 3], null, [4, null], 5])
    .then(res => {
      sandbox.restore();
      done();
    })
    .catch(err => {
      console.log('error: ', err);
      sandbox.restore();
      done(err);
    });
  });

  it('should run the same input query if params do not include arrays', (done) => {
    const db = require('../index')({host: 'mysql', name: 'foo'});
    const connectionStub = {
      execute: function(query, params){
        assert.equal(query, 'SELECT FROM tbl_name WHERE col_name = ? AND col_name_1 = ?');
        assert.deepEqual(params, [1, 2]);

        return [];
      },
      release: function() { },
      connection: {unprepare: function() {}}
    };
    const sandbox = sinon.sandbox.create();
    sandbox.stub(db, 'configure').callsFake(function(config) { });
    sandbox.stub(db, 'getConnection').resolves(connectionStub);
    db.query('SELECT FROM tbl_name WHERE col_name = ? AND col_name_1 = ?', [1, 2])
    .then(res => {
      sandbox.restore();
      done();
    })
    .catch(err => {
      console.log('error: ', err);
      sandbox.restore();
      done();
    });
  });

  it('should run the same query if no params provided', (done) => {
    const db = require('../index')({host: 'mysql', name: 'foo'});
    const connectionStub = {
      execute: function(query, params){
        assert.equal(query, 'SELECT FROM tbl_name WHERE col_name = x');
        assert.deepEqual(params, undefined);

        return [];
      },
      release: function() { },
      connection: {unprepare: function() {}}
    };
    const sandbox = sinon.sandbox.create();
    sandbox.stub(db, 'configure').callsFake(function(config) { });
    sandbox.stub(db, 'getConnection').resolves(connectionStub);
    db.query('SELECT FROM tbl_name WHERE col_name = x', undefined)
    .then(res => {
      sandbox.restore();
      done();
    })
    .catch(err => {
      console.log('error: ', err);
      sandbox.restore();
      done(err);
    });
  });
});
