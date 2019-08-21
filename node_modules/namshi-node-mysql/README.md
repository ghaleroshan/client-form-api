# node-mysql

This wrapper provides some enhancements for [`node-mysql2`](https://github.com/sidorares/node-mysql2)

[![Build Status](https://travis-ci.com/namshi/node-mysql.svg?token=V2NdsNG4wfMuQLkCArk9&branch=master)](https://travis-ci.com/namshi/node-mysql)

## Installation

This module can be installed with either yarn or npm:


``` bash
$ yarn add namshi-node-mysql
```

``` bash
$ npm install namshi-node-mysql --save
```

## Example Usage of query

`query()` uses [prepared statements](https://github.com/sidorares/node-mysql2#prepared-statements) but does not support bulk operations.

``` js

let config = {
	host: "localhost",
	user: "foo",
	password: "bar",
	database: "db"
}

let db = require('namshi-node-mysql')(config);

db.query('UPDATE foo SET key = ?', ['value']).then(() => {
	return db.query('SELECT * FROM foo');
}).spread(rows => {
	console.log('Look at all the foo', rows);
});

// using multiple databases, you can add a "name" key to your config object. For example:
let config = {
	name: "second-db",
	host: "localhost",
	user: "foo",
	password: "bar",
	database: "db"
}

let db2 = require('namshi-node-mysql')(config);

db2.query('SELECT * FROM users').spread(users => {
	console.log('Hello users', users);
});


```
## Enable DEBUG mode to log the query being executed and its parameters.

``` js
// You can enable debugging by passing the `debug` parameter as follow:
// by default it is set to false.

let config = {
	host: "localhost",
	user: "foo",
	password: "bar",
	database: "db",
	debug: true;
}
```



## Example Usage of bulk

`bulk()` uses `execute` which supports prepared statements and we use prepared statements for bulk.

``` js

let config = {
	host: "localhost",
	user: "foo",
	password: "bar",
	database: "db"
}

var values = [
    ['demian', 'demian@gmail.com', 1],
    ['john', 'john@gmail.com', 2],
    ['mark', 'mark@gmail.com', 3],
    ['pete', 'pete@gmail.com', 4]
];
let db = require('namshi-node-mysql')(config);

db.bulk('INSERT INTO foo (name, email, n) VALUES ?', values).then(() => {
	return db.query('SELECT * FROM foo');
}).spread(rows => {
	console.log('Look at all the foo', rows);
});

```

## Example of prepareBulk

`prepareBulk()` can be used if you want to format a query for bulk operation with a connection reused for a transaction.

``` js

let config = {
	host: "localhost",
	user: "foo",
	password: "bar",
	database: "db"
}

var values = [
    ['demian', 'demian@gmail.com', 1],
    ['john', 'john@gmail.com', 2],
    ['mark', 'mark@gmail.com', 3],
    ['pete', 'pete@gmail.com', 4]
];
let db = require('namshi-node-mysql')(config);
let connection;

db.startTransaction().then(conn => {
	connection = conn;
}).then(() => {
	let [query, params] = db.prepareBulk('INSERT INTO foo (name, email, n) VALUES ?', [values]);
	return connection.execute(query, params);
}).then(result => {
	return db.commit(connection);
}).then(result => {
	console.log('Rows committed');
}).catch(err => {
	db.rollback(connection).then(result => {
		console.log('Rollback executed due to ', err.message);
	});
})
```

## Example usage of [namedPlaceholders]((https://github.com/sidorares/node-mysql2#named-placeholders))

``` js
let config = {
	host: "localhost",
	user: "foo",
	password: "bar",
	database: "db",
	namedPlaceholders: true
}

let db = require('namshi-node-mysql')(config);

db.query('SELECT * FROM users WHERE LIMIT = :limit', {limit: 10}).spread( users => {
	console.log('Hello users', users);
});

```

## Example usage of startTransaction, commit and rollback


``` js
let config = {
	host: "localhost",
	user: "foo",
	password: "bar",
	database: "db"
}

let db = require('namshi-node-mysql')(config);

let connection;

db.startTransaction(30).then(conn => {
	connection = con;
}).catch(err) {
	//handle error
};

//default timeout here is set to 20
db.startTransaction().then(conn => {
	connection = con;
}).catch(err) {
	//handle error
};

db.commit(connection).catch(err => {
	//handle err
});

db.rollback(connection).catch(err => {
	//handle err
});
```

## Credits

This library depends on [node-mysql2](https://github.com/sidorares/node-mysql2). It is also considered a breaking-change upgrade of [node-mysql2-promise](https://github.com/namshi/node-mysql2-promise).
