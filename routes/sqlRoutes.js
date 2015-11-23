var sqlClient = require('../models/mysql.js');

// exports.loadSenator = function(req, res) {
//   var query = {"cid": req.params.cid}
//   findDocument('senators', query, 'senator', res);
// }
// exports.loadOrganization = function(req, res) {
//   var query = {"name": req.params.encodedname}
//   findDocument('organizations', query, 'organization', res);
// }


exports.findAll = function(req, res) {
  sqlClient.findAll(req.params.table, function(data) {
    res.send(data);
  });
}

exports.loadOrganization = function(req, res) {
  sqlClient.findOrganization(req.params.name, function(data) {
    var header = req.params.name.replace(/\'\'/g,"\'");
    res.render('organization', {obj: data, header: header});
  });
}

exports.loadSenator = function(req, res) {

}

// In the case that no route has been matched
exports.errorMessage = function(req, res){
  var message = '<p>Error, did not understand path '+req.path+"</p>";
  // Set the status to 404 not found, and render a message to the user.
  res.status(404).send(message);
};


/*
To Do:
1. Modify map and senator_typeahead to make AJAX db call to /senators
2. Write new routes / db methods to cover existing functionality. They'll consist of two calls, one to that particular
   senator or org, and another using that result's id to find all of the donations

*/