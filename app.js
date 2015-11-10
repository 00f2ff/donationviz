var express = require("express");
var morgan = require('morgan');

var app = express();

// Set the views directory
app.set('views', __dirname + '/views');

// load static pages
app.use(express.static(__dirname + '/public'));

// Define the view (templating) engine
app.set('view engine', 'ejs');

// logging
app.use(morgan('dev'));


app.listen(50000);
console.log("Server listening at http://localhost:50000/");