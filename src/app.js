// Retrieve environment variables
require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

// Configure passport
const passport = require('./passport.js');

// Session middleware
// NOTE: Uses default in-memory session store, which is not suitable for production
var session = require('express-session');
app.use(session({
  secret: 'your_secret_value_here',
  resave: false,
  saveUninitialized: false,
  unset: 'destroy'
}));

// Flash middleware
var flash = require('connect-flash');
app.use(flash());

// Set up local vars for template layout
app.use(function (req, res, next) {
  // Read any flashed errors and save
  // in the response locals
  res.locals.error = req.flash('error_msg');

  // Check for simple error string and
  // convert to layout's expected format
  var errs = req.flash('error');
  for (var i in errs) {
    res.locals.error.push({ message: 'An error occurred', debug: errs[i] });
  }
  next();
});

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Helper to format date/time sent by Graph
var hbs = require('hbs');
var moment = require('moment');
hbs.registerHelper('eventDateTime', function (dateTime) {
  return moment(dateTime).format('M/D/YY h:mm A');
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Set the authenticated user in the template locals
app.use(function (req, res, next) {
  if (req.user) {
    res.locals.user = req.user.profile;
  }
  next();
});

// Configure Routes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var calendarRouter = require('./routes/calendar');
var authRouter = require('./routes/auth');
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/calendar', calendarRouter);
app.use('/auth', authRouter);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
