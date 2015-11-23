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
// refactor the shit out of this later

// General donation finder
function findDonations(table, id, callback) {
  var queryString = 'SELECT * FROM Donations WHERE ';
  if (table === 'Organizations') {
    queryString += 'organization_id = ?';
  } else if (table === 'Senators') {
    queryString += 'senator_id = ?';
  }
  con.query(queryString, id, function(err, rows) {
    if (err) throw err;
    console.log(rows);
    for (var i = 0; i < rows.length; i++) {
      findSenatorFromDonation(rows[i].senator_id, function(senator) {
        console.log(senator)
        rows[i]["senator"] = senator[0];
      });
    }
    callback(rows);
  })
}

function findSenatorFromDonation(senator_id, callback) {
  con.query('SELECT * FROM Senators WHERE id = ?', senator_id, function(err, rows) {
    if (err) throw err;
    console.log(rows);
    callback(rows);
  })
}

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

exports.findOrganization = function(name, callback) {
  // con.query('SELECT * FROM Organizations WHERE name = ? INNER JOIN Donations ON id = organization_id', name, function(err, rows) {
  // var queryString = 'select * from senators s inner join donations d on s.id = d.senator_id inner join organizations o on d.organization_id = o.id where o.name = ? GROUP BY state';
  var queryString = 'SELECT * FROM Organizations WHERE name = ?';
  con.query(queryString, name, function(err, rows) {
    if (err) throw err;
    row = rows[0];
    findDonations('Organizations', row.id, function(donations) {
      row["donations"] = donations;
      console.log(row);
      callback(row);
    });
    
  })
}



// con.end(function(err) {
//   // The connection is terminated gracefully
//   // Ensures all previously enqueued queries are still
//   // before sending a COM_QUIT packet to the MySQL server.
// });