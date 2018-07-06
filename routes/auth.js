const express = require('express');
const bcrypt = require('bcrypt');
const RateLimit = require('express-rate-limit');
const models = require('../models');
const authSession = require('../middleware/auth_session');

const { Setting } = models;
const router = express.Router();

const authLimiter = new RateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 5,
  delayMs: 0,
});

const requiresEmptySettings = (req, res, next) => {
  Setting.findAll({ attributes: ['id'] }).then((settings) => {
    if (settings.length > 0) {
      const err = new Error('App has already been initialized');
      next(err);
    }
    next();
  });
};

const renderInitialize = (res, err = null) => {
  res.render('initialize', { title: 'Initialize Shortly', err });
};

/* GET initialization page */
router.get('/initialize', requiresEmptySettings, (req, res, next) => {
  renderInitialize(res);
});

/* POST initialization page */
router.post('/initialize', requiresEmptySettings, authLimiter, (req, res, next) => {
  // Always check init password first
  const {
    username, password, websiteUrl, initializePassword,
  } = req.body;
  if (initializePassword !== 'password') {
    renderInitialize(res, 'Invalid admin password');
  }

  // Initialize settings
  bcrypt.hash(password, 10).then(hash => (
    models.sequelize.transaction(t => (
      Setting.create({
        key: 'username',
        value: username,
      }, { transaction: t }).then(s => (
        Setting.create({
          key: 'password',
          value: hash,
        }, { transaction: t }))).then(s => (
        Setting.create({
          key: 'website_url',
          value: websiteUrl,
        }, { transaction: t })))
    ))
  )).then(result => (
    res.redirect('/auth/login')
  )).catch((err) => {
    renderInitialize(res, 'Error setting up database!');
  });
});

const renderLogin = (res, err = null) => {
  res.render('login', { title: 'Log into Shortly', err });
};

/* GET login page */
router.get('/login', (req, res, next) => {
  renderLogin(res);
});

/* POST login page */

const checkLogin = (req, settings) => {
  if (settings.get('username') !== req.body.username) return false;
  return bcrypt.compare(req.body.password, settings.get('password'));
};

router.post('/login', authLimiter, (req, res, next) => {
  Setting.findAll({ attributes: ['key', 'value'] }).then((rawSettings) => {
    const settings = new Map(rawSettings.map(i => [i.key, i.value]));
    return checkLogin(req, settings);
  }).then((isValid) => {
    if (isValid) {
      authSession.login(req);
      res.redirect('/urls');
    } else {
      renderLogin(res, 'Your username or password was incorrect.');
    }
  }).catch((err) => {
    console.log(err);
    renderLogin(res, 'Unable to login');
  });
});

module.exports = router;
