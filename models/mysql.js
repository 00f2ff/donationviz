var mysql = require("mysql");

// First you need to create a connection to the db
var con = mysql.createConnection({
  host: "localhost",
  user: "testuser",
  password: "test",
  database: "testdb"
});

con.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection established');
});

exports.findAll = function(table, callback) {
  console.log(table);
  var queryString;
  if (table === 'senators') {
    queryString = 'SELECT * FROM senators ORDER BY state ASC';
  } else if (table === 'organizations') {
    queryString = 'SELECT * FROM organizations';
  }
  // not controlling for donations or anything else right now
  con.query(queryString, function(err, rows){
    if(err) throw err;

    // console.log('Data received from Db:\n');
    callback(rows);
  });
}



// con.end(function(err) {
//   // The connection is terminated gracefully
//   // Ensures all previously enqueued queries are still
//   // before sending a COM_QUIT packet to the MySQL server.
// });