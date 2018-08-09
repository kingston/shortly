const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const logger = require('morgan');
const helmet = require('helmet');

const env = process.env.NODE_ENV || 'development';
const config = require('./config/config.json')[env];

const authRouter = require('./routes/auth');
const urlsRouter = require('./routes/urls');
const models = require('./models');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const sessionSettings = {
  cookie: {
    httpOnly: true,
    maxAge: 30 * 60 * 1000,
    sameSite: true,
  },
  store: models.sessionStore,
  secret: config.secret,
  saveUninitialized: false,
  resave: false,
};

if (app.get('env') === 'production') {
  app.set('trust proxy', 'loopback');
  sessionSettings.cookie.secure = true;
  sessionSettings.proxy = true;
}

app.use(session(sessionSettings));

app.use('/auth', authRouter);
app.use('/', urlsRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => next(createError(404)));

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
