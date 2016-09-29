var express = require('express');
var path = require('path');
var morgan = require('morgan'); // logger
var bodyParser = require('body-parser');
var api = require('./backend/api');
var Cookies = require( "cookies" );

var app = express();
app.set('port', (process.env.APP_PORT || 3000));

app.use('/', express.static(__dirname + '/../../dist'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(morgan('dev'));

// cookies
app.use(Cookies.express());
app.use(api.sessionidCookie);

app.use('/', express.static(__dirname + '../dist'));
app.use('/assets', express.static(path.join(__dirname, '../dist/assets'), {maxAge: 30}));
app.use(express.static(path.join(__dirname, '../dist'), {index: false}));

// APIs
app.get('/test', api.test);

// all other routes are handled by Angular
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.get('*', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  var pojo = { status: 404, message: 'No Content' };
  var json = JSON.stringify(pojo, null, 2);
  res.status(404).send(json);
});

app.listen(app.get('port'), function() {
  console.log('Angular 2 Full Stack listening on port '+app.get('port'));
});

module.exports = app;
