var express = require("express");
var morgan = require('morgan');
var sqlRoutes = require('./routes/sqlRoutes');

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
// app.get('/senator/:id', sqlRoutes.loadSenator);
// app.get('/organization/:id', sqlRoutes.loadOrganization);
app.get('/:table', sqlRoutes.findAll);

// Catch any routes not already handed with an error message
app.use(sqlRoutes.errorMessage);

app.listen(50000);
console.log("Server listening at http://localhost:50000/");