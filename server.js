// Importing Node modules and initializing Express
const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    logger = require('morgan'),
    router = require('./app/router'),
    mongoose = require('mongoose'),
    socketEvents = require('./app/socketEvents'),
    config = require('./app/config/main');



// Connnect database
mongoose.connect(config.database);
mongoose.set('debug', true);

// Start the server
var server = app.listen(config.port,function(){
    console.log(`Your server is running on port ${config.port}.`);
});

//-- socket
const io = require('socket.io').listen(server);
socketEvents(io);


// Set static file location for production
 app.use(express.static(__dirname + '/public'));


// Setting up basic middleware for all Express requests

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
//app.use(bodyParser.urlencoded({ extended: false })); // Parses urlencoded bodies
//app.use(bodyParser.json()); // Send JSON responses
app.use(logger('dev')); // Log requests to API using morgan

// Enable CORS from client-side
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

// Import routes to be served
router(app);

// necessary for testing
module.exports = server;