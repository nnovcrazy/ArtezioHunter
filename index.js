process.on('unhandledRejection', function(reason, p) {
    console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);
// application specific logging, throwing an error, or other logic here
});

var express = require('express'),
    passport = require('passport'),
    request = require('request'),
    util = require('util'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    engine = require('ejs-locals'),
    session = require('express-session'),
    methodOverride = require('method-override'),
    morgan = require('morgan'),
    HeadHunterStrategy = require('passport-headhunter').Strategy;

var app = express();
app.set('host', require('os').hostname());
app.set('port', process.env.npm_package_config_port);

var HEADHUNTER_CLIENT_ID = "VSQ50LA2PVUFQV3SLFMPAGG2RAQ57LA5OES3VPF38NES6BD5OCTLVV278FQ0C05M";
var HEADHUNTER_CLIENT_SECRET = "MVV526B962HVFGPBKKN1CHMMR8QSNE6FGE4S9QTJPVBGK1D8N2F1M9SE9Q29JGFR";
var HEADHUNTER_CALLBACK_URL = "http://"+app.get('host')+":"+app.get('port')+"/auth/headhunter/callback";//TODO: check it on page https://dev.hh.ru/admin

app.engine('ejs', engine);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(methodOverride());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'keyboard cat'
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));


app.get('/', function (req, res) {
    res.render('index', {user: req.user});
});

app.get('/account', function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login')
}, function (req, res) {
    res.render('account', {user: req.user});
});

app.get('/login', function (req, res) {
    res.render('login', {user: req.user});
});


app.get('/auth/headhunter', passport.authenticate('headhunter'));
app.get('/auth/headhunter/callback', passport.authenticate('headhunter', {failureRedirect: '/login'}), function (req, res) {
    res.redirect('/');
});

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

console.log('env', process.env.NODE_ENV)

app.listen(app.get('port'), function() {
    var url = 'http://' + require('os').hostname() +':'+ app.get('port')

    if (process.env.NODE_ENV == 'DEVELOPMENT') {
        console.log('listen', url)
        require("open")(url);
    }
});


passport.serializeUser(function (user, done) {done(null, user);});
passport.deserializeUser(function (obj, done) {done(null, obj);});

passport.use(new HeadHunterStrategy({
    clientID: HEADHUNTER_CLIENT_ID,
    clientSecret: HEADHUNTER_CLIENT_SECRET,
    callbackURL: HEADHUNTER_CALLBACK_URL
}, function (accessToken, refreshToken, profile, done) {
        console.log('accessToken', accessToken);
        console.log('refreshToken', refreshToken);
        console.log('profile', profile);

        /*request({
            url: 'https://api.hh.ru/resumes/mine',
            headers: {
                'User-Agent': process.env.npm_package_name+' '+process.env.npm_package_version+' (Dmitriy.Alexandrov@artezio.com)'//This important must inherits e-mail
            }
        }, function(err, response, rawdata) {
            console.log('err', err)
            //console.log('response', response)
            console.trace('rawdata', rawdata)
        });*/

        return done(null, profile);
    }
));





