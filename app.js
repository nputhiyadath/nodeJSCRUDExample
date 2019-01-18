//Start dependencies
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');

const indexRouter = require('./routes/index');
const employeeRouter = require('./routes/employee');
const mongoose = require('mongoose');
const passport = require('passport');
const Strategy = require('passport-facebook').Strategy;
const Auth0Strategy = require('passport-auth0');
const oauthConfig = require('./config/oauth2');
const auth0config = require('./config/auth0');

//End dependencies

//Start passport config
//Facebook config
passport.use(new Strategy({
        clientID: oauthConfig.clientID,
        clientSecret: oauthConfig.clientSecret,
        callbackURL: oauthConfig.callbackURL,
        profileFields: oauthConfig.profileFields
    },
    function (accessToken, refreshToken, profile, cb) {
        return cb(null, profile);
    }
));

//Auth0Config
passport.use(new Auth0Strategy({
        domain: auth0config.domain,
        clientID: auth0config.clientID,
        clientSecret: auth0config.clientSecret,
        callbackURL: auth0config.callbackURL
    },
    function (accessToken, refreshToken, extraParams, profile, cb) {
        return cb(null, profile);
    }
));

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

// End passport config

/*Express app config*/

const app = express();

const db = require('./config/db');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true, // true = .sass and false = .scss
    sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Passport and restore authentication state, if any, from session.
app.use(require('express-session')({secret: 'holler', resave: true, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());


/* Start Routes */

//Start FB routes
app.get('/login/facebook',
    passport.authenticate('facebook'));

app.get('/login/facebook/return',
    passport.authenticate('facebook', {failureRedirect: '/login'}),
    (req, res) => {
        res.redirect('/');
    });

//End FB routes


//Start Auth0 routes
app.get('/login/auth0',
    passport.authenticate('auth0', {}), function (req, res) {
        res.redirect("/");
    });

app.get('/login/callback',
    passport.authenticate('auth0', {failureRedirect: '/login'}),
    function (req, res) {
        if (!req.user) {
            throw new Error('user null');
        }
        res.redirect("/");
    }
);

//End Auth0 routes

//Start Login Logout Common
app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

//End Login Logout Common

//Routers from module
app.use('/', indexRouter);
app.use('/employees', employeeRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

//Connect to MongoDB

mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true}).then(
    () => {
        console.log('connection successful');
    }
).catch((err) => {
    console.log('Failed to connect');
});

//End

module.exports = app;