var util = require("util");
var mongoClient = require('mongodb').MongoClient;
/*
 * This is the connection URL
 * Give the IP Address / Domain Name (else localhost)
 * The typical mongodb port is 27012
 * The path part (here "test") is the name of the database
 */
var url = 'mongodb://localhost:27017/test';
var mongoDB; // The connected database
// Use connect method to connect to the Server
mongoClient.connect(url, function(err, db) {
  if (err) doError(err);
  console.log("Connected correctly to server");
  mongoDB = db;
});

// FIND
exports.find = function(collection, query, callback) { // crsr = cursor
  var crsr = mongoDB.collection(collection).find(query);
  crsr.toArray(function(err, docs) {
    if (err) doError(err);
    callback(docs);
  });
}

var doError = function(e) {
    util.debug("ERROR: " + e);
    throw new Error(e);
}
