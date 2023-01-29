var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// ---------------------- saml begin -----------------
var cors = require('cors');
require('dotenv').config();
var fs = require('fs')
var passport = require('passport');
var session = require('express-session');
var SamlStrategy = require('passport-saml').Strategy;

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});
passport.use(new SamlStrategy(
  {
    callbackUrl: process.env.SAML_CALLBACK_URL,
    entryPoint: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/saml2`,
    issuer: process.env.AZURE_AD_ENTERPRISE_APP_SAML_Identifier,
    cert: fs.readFileSync(process.env.AZURE_AD_SAML_CERT_B64, 'utf-8'),
    signatureAlgorithm: 'sha256'
  },
  (profile, done) => {
    return done(null,
      {
        id: profile['nameID'],
        email: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
        displayName: profile['http://schemas.microsoft.com/identity/claims/displayname'],
        firstName: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'],
        lastName: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'],
        assertionXml: profile.getAssertionXml(),
      });
  })
);
// ---------------------- saml end -----------------

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var tasksRouter = require('./routes/tasks');

var app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// ---------------------- saml begin -----------------
app.use(cors({
  origin: [process.env.CORS_ALLOW_URL],
  credentials: true
}));

// without this cookie setting, session cookie won't be sent back when making axios call from another domain
app.use(session({ resave: true, saveUninitialized: true, secret: process.env.MY_SESSION_SECRET, cookie: { sameSite: 'none', secure: true } }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login',
  (req, res, next) => {
    console.log("login cookie:", req.cookies);
    req.query.RelayState = req.query.returnTo;
    passport.authenticate('saml', { successRedirect: req.query.returnTo || '/', failureRedirect: '/login', })(req, res, next);
  }
);
app.post('/login/callback',
  passport.authenticate('saml', { failureRedirect: '/login', failureFlash: true }),
  (req, res) => {
    console.log("session id", req.sessionID);
    res.redirect(req.body.RelayState || '/');
  }
);
// ---------------------- saml end -----------------

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/tasks', tasksRouter);

// catch 404 and forward to error handler
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
