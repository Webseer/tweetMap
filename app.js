var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');

//returns twitter auth credentials in this format
// function(){
//   return {
//         consumer_key: '',
//         consumer_secret: '',
//         access_token_key: '',
//         access_token_secret: ''
//     };
// };
var credentials = require('./credentials').twitterCred();

var myList =  require('./config').keywords();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var server = require('http').Server(app);
var io = require('socket.io')(server);
var twitter = require('ntwitter');

server.listen(process.env.PORT || 3000);
console.log("started");

createTwitter();

function createTwitter() {
    console.log("connecting to twitter");
    twit = new twitter(credentials);

    twit.stream('user',{track:myList}, function(stream) 
    {
        console.log("streaming");
        stream.on('data', function (tweet) 
        {
            console.log("tweet received");
            if(tweet.geo)
            {
                console.log("geo referenced tweet");
                var geo = tweet.geo;
                if(geo.coordinates)
                {
                    console.log(geo.coordinates);
                    io.sockets.emit('message', JSON.stringify(tweet));
                }

            }
        });
    });
}

module.exports = app;
