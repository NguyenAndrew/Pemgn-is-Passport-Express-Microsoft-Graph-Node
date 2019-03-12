// Retrieve environment variables
require('dotenv').config();

var express = require('express');
var path = require('path');

var app = express();

// Allow express to parse body 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session middleware NOTE: Uses default in-memory session store, which is not suitable for production
var session = require('express-session');
app.use(session({
  secret: 'your_secret_value_here',
  resave: false,
  saveUninitialized: false,
  unset: 'destroy'
}));

// Configure passport, must be after session middleware
const passport = require('./passport.js');
app.use(passport.initialize());
app.use(passport.session());

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Helper to format date/time sent by Graph
var hbs = require('hbs');
var moment = require('moment');
hbs.registerHelper('eventDateTime', function (dateTime) {
  return moment(dateTime).format('M/D/YY h:mm A');
});

// Parse authorization code cookie sent from Microsoft redirect
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

// Put authenticated user profile in the template locals
app.use(function (req, res, next) {
  if (req.user) {
    res.locals.user = req.user.profile;
  }
  next();
});

// Configure Routes
var indexRouter = require('./routes/index');
var calendarRouter = require('./routes/calendar');
var authRouter = require('./routes/auth');
app.use('/', indexRouter);
app.use('/calendar', calendarRouter);
app.use('/auth', authRouter);

module.exports = app;
