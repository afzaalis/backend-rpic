const mysql = require('mysql2');

const db = mysql.createPool({
  host: 'shinkansen.proxy.rlwy.net',
  user: 'root',
  password: 'JNkffZDguCtpxRHQYenkKzZfczxfmDKI',
  database: 'railway',
  port: 55011,
});

const promiseDb = db.promise();
module.exports = promiseDb;
