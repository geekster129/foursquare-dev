const express = require('express');
var request = require('request');
const app = express();
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 3000;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var githubLoginRouter = express.Router();              // get an instance of the express Router

var githubFetchRouter = express.Router();

var githubCallbackRouter = express.Router();

githubFetchRouter.get('/', function(req, res) {
	MongoClient.connect('mongodb://localhost:27017/local', function (err, db) {
	  if (err) throw err

	  db.collection('github-login').find().toArray(function (err, result) {
		if (err) throw err
		 res.setHeader('Content-Type', 'application/json');
		 res.json({ message: result});   
	  })
	}) 
});

githubLoginRouter.get('/', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
    res.json({ message: 'Login Successful' });   
});

githubCallbackRouter.get('/', function(req, res) {
	var code = req.query.code;
	var access_token = "";
	
	console.log(req);
	access_token = req.access_token; //response.body.split("&")[0].split("=")[1];
	 
	console.log("Access Token:" + access_token);
	 
	var options = {
	  url: 'https://api.github.com/user?access_token=' + access_token,
	  headers: {
		'User-Agent': 'lab'
	  }
	};
			 
	request(options, function (error, response, body) {
	  console.log(response.statusCode);
	  if (!error) {
		MongoClient.connect('mongodb://localhost:27017/local', function (err, db) {
		  if (err) throw err

		  db.collection('github-login').insertOne({_id: JSON.parse(body).id , profile: JSON.parse(body)});
		  
		}) 			 
	  }
	});	
    //res.json({ message: 'Login Successful From Github!' + access_token });   
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/login', githubLoginRouter);
app.use('/fetchusers', githubFetchRouter);
app.use('/callback', githubCallbackRouter);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Server started on port ' + port);
