var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var port =3000;

// Use body-parser to get POST requests for API use
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Log requests to console
app.use(morgan('dev'));
// Home route. We'll end up changing this to our main front end index later.
app.get('/', function(req, res) {
    res.send('Relax. We will put the home page here later.');
});

app.listen(port, function(){
    console.log('Express server listening on port '+port+' .');
});