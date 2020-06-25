var express = require('express');
var app = express();
var https = require('https');
const fs = require('fs');
const rateLimit = require("express-rate-limit");

//Prepare the port
var port = process.env.PORT || 8080;
var rates = (process.env.RATELIMIT || '3/60').split('/').map(c => parseInt(c));

//Load the accounts
const accounts = JSON.parse(fs.readFileSync('accounts.json'));

// Setup the ratelimit
const limiter = rateLimit({
  windowMs: rates[1] * 1000, 
  max: 		rates[0],
  handler: (req, res) => {
				res.setHeader('content-type', 'application/json');
				res.status(429).send(JSON.stringify({ "error": "too many requests", "rate-limit": rates }));
			},
});

//  apply to all requests
app.use(limiter);

//Listen to the server
var server = app.listen(port, function () {
	console.log("PORT: %s", port);
	console.log("RATELIMIT: ", rates);
	console.log("ACCOUNTS: %s", Object.keys(accounts).length);
})

app.get('/:user', function (req, res) {
	
	//Validate the user is authorize
	let user = authorize(req, res);
	if (user === false) return;
	
	var options = {
		host: 'github.com',
		port: 443,
		path: '/' + user.profile,
		method: 'GET',
		headers: {
			accept: 'text/html'
		}
	};
	https.request(options, function(cres){
		cres.setEncoding('utf8');
		
		var body = '';
		cres.on('data', function (chunk) { body += chunk; });
		cres.on('end', function () {
			var calander = {};
			
			// get calendar wihtout svg tag
		  	body = body.slice(body.indexOf('js-calendar-graph-svg')+23); 
		  	body = body.slice(0, body.indexOf('</svg>'));

		  	body.split("\n").slice(2).map(c => c.trim()).forEach(c => {
		  		let dataCount = c.match(/data-count="(\d+)"/);
		  		if(dataCount){
					let dataDate = c.match(/data-date="(\d{4}-\d{2}-\d{2})"/);
					calander[dataDate[1]] = parseInt(dataCount[1]);
		  		}
		  	});
			
		  	var obj = calander;
			res.setHeader('content-type', 'application/json');
		  	res.send(JSON.stringify(obj));
		});

	}).end();
})

app.get('/:user/monthly', function (req, res) {
	
	//Validate the user is authorize
	let user = authorize(req, res);
	if (user === false) return;
	
	var options = {
		host: 'github.com',
		port: 443,
		path: '/' + user.profile,
		method: 'GET',
		headers: {
			accept: 'text/html'
		}
	};
	https.request(options, function(cres){
		cres.setEncoding('utf8');
		
		var body = '';
		cres.on('data', function (chunk) { body += chunk; });
		cres.on('end', function () {
			var calander = {};
			
			// get calendar wihtout svg tag
		  	body = body.slice(body.indexOf('js-calendar-graph-svg')+23); 
		  	body = body.slice(0, body.indexOf('</svg>'));

		  	body.split("\n").slice(2).map(c => c.trim()).forEach(c => {
		  		let dataCount = c.match(/data-count="(\d+)"/);
		  		if(dataCount){
					let dataDate = c.match(/data-date="(\d{4}-\d{2}-\d{2})"/);
					let date = new Date(dataDate[1]);
					if (calander[date.getFullYear()] == null) calander[date.getFullYear()] = [];
					if (calander[date.getFullYear()][date.getMonth()] == null) calander[date.getFullYear()][date.getMonth()] = [];
					calander[date.getFullYear()][date.getMonth()][date.getDate()-1] = parseInt(dataCount[1]);
		  		}
		  	});
			
		  	var obj = calander;
			res.setHeader('content-type', 'application/json');
		  	res.send(JSON.stringify(obj));
		});

	}).end();
})

// Total number of commits this year
app.get('/:user/tally', function (req, res) {
	
	//Validate the user is authorize
	let user = authorize(req, res);
	if (user === false) return;
	
	var options = {
		host: 'github.com',
		port: 443,
		path: '/' + user.profile,
		method: 'GET',
		headers: {
			accept: 'text/html'
		}
	};
	https.request(options, function(cres){
		cres.setEncoding('utf8');
		var body = '';

		cres.on('data', function (chunk) {
			body += chunk;
		});

		cres.on('end', function () {
	  		var counter = 0;
			// get calendar wihtout svg tag
		  	body = body.slice(body.indexOf('js-calendar-graph-svg')+23); 
		  	body = body.slice(0, body.indexOf('</svg>'));

		  	body.split("\n").slice(2).map(c => c.trim()).forEach(c => {
		  		let fill = c.match(/data-count="([0-9]+)"/);
		  		if(fill){
		  			counter += parseInt(fill[1]);
		  		}
		  	});
		  	var obj = { "count" : counter}
			
			res.setHeader('content-type', 'application/json');
		  	res.send(JSON.stringify(obj));
		});
	}).end();
})

function authorize(req, res) {
	
	if (req.params.user && accounts[req.params.user] != null) {
		let user = accounts[req.params.user];
		if (req.get('authorization') == user.key) {
			return user;
		}
	}
	
	res.status(403);
	res.setHeader('content-type', 'application/json');
	res.send(JSON.stringify({ "error": "forbidden" }));
	return false;
}
