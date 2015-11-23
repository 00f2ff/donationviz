var mongo = require('../models/mongo.js');

// modify this to send title as well
function findDocument(collection, query, template, res) {
	mongo.find(collection, query, function(doc) {
		res.render(template, {obj: doc, header: query.name});
	});
}

exports.loadSenator = function(req, res) { // can refactor this now to use a switch or conditional
	var query = {name: req.params.name}
	findDocument('senators', query, 'senator', res);
}
exports.loadOrganization = function(req, res) {
	var query = {"name": req.params.name}
	findDocument('organizations', query, 'organization', res);
}

// In the case that no route has been matched
exports.errorMessage = function(req, res){
  var message = '<p>Error, did not understand path '+req.path+"</p>";
	// Set the status to 404 not found, and render a message to the user.
  res.status(404).send(message);
};