var express = require('express'),
	http = require('http'),
	path = require('path');

var app = express();

app.mongoose = require('mongoose');
app.$ = require('jquery');
app.cfg = require('./config');
app.cache = {};

app.configure(function(){
	app.set('port', process.env.PORT || app.cfg.general.port);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.compress());
	app.use(express.methodOverride());
	app.use(express.cookieParser(app.cfg.general.cookiesecret));
	app.use(express.session());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, '../public')));
	app.use(require('less-middleware')({ src: __dirname + '../../public' }));
});

app.configure('development', function(){
	app.use(express.errorHandler());
	app.mongoose.connect(app.cfg.general.dev.mongodbconnectionstring);
});

var models = {};
models.products = require('./models/product')(app.mongoose);

// Routes
require('./routes/admin')(app, models);
require('./routes/site')(app, models);


http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});
