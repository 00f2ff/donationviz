var express = require("express");
var morgan = require('morgan');
var dbRoutes = require('./routes/dbRoutes');

var app = express();

// logging
app.use(morgan('dev'));

// Set the views directory
app.set('views', __dirname + '/views');
// Define the view (templating) engine
app.set('view engine', 'ejs');

// load static pages
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) { res.render('index', {'header': 'Senators by State'}); });
// My assumption is that companies don't have the same name since I don't have a good identifier
// Using senator names for simplicity
app.get('/senator/:name', dbRoutes.loadSenator);
app.get('/organization/:name', dbRoutes.loadOrganization);
app.get('/industry/:name', dbRoutes.loadIndustry); // ids are more convenient, but use name for consistency

// Catch any routes not already handed with an error message
app.use(dbRoutes.errorMessage);


app.listen(50000);
console.log("Server listening at http://localhost:50000/");