const express = require('express');
const bcrypt = require('bcrypt');
const RateLimit = require('express-rate-limit');
const models = require('../models');
const authSession = require('../middleware/auth_session');
const config = require('../config/config');
const logger = require('../utilities/logger.js');

const { Setting } = models;
const router = express.Router();

const authLimiter = new RateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 5,
  delayMs: 0,
});

// SECTION: Initialization code

// Ensure settings haven't been set up
async function requiresEmptySettings(req, res, next) {
  try {
    const settings = await Setting.findAll({ attributes: ['id'] });
    if (settings.length > 0) {
      const err = new Error('App has already been initialized');
      next(err);
    }
    next();
  } catch (err) {
    logger.error('Unable to check for empty settings', err);
    next(err);
  }
}

function renderInitialize(res, err = null) {
  res.render('initialize', {
    title: 'Initialize Shortly',
    alertMessage: err,
    alertType: 'error',
  });
}

/* GET initialization page */
router.get('/initialize', requiresEmptySettings, (req, res, next) => {
  renderInitialize(res);
});

/* POST initialization page */
router.post('/initialize', requiresEmptySettings, authLimiter, async (req, res, next) => {
  try {
    const {
      username, password, websiteUrl, initializePassword,
    } = req.body;

    // Always check init password first
    if (initializePassword !== config.adminPassword) {
      renderInitialize(res, 'Invalid admin password');
    }

    // Initialize settings
    const hash = await bcrypt.hash(password, 10);

    models.sequelize.transaction(async (t) => {
      await Promise.all([
        Setting.create({
          key: 'username',
          value: username,
        }, { transaction: t }),
        Setting.create({
          key: 'password',
          value: hash,
        }, { transaction: t }),
        Setting.create({
          key: 'website_url',
          value: websiteUrl,
        }, { transaction: t }),
      ]);
    });
    res.redirect('/auth/login');
  } catch (err) {
    logger.error('Error initializing', err);
    renderInitialize(res, 'Error setting up database!');
  }
});

// SECTION: Login things...

const renderLogin = (res, err = null) => {
  res.render('login', {
    title: 'Log into Shortly',
    alertMessage: err,
    alertType: 'error',
  });
};

/* GET login page */
router.get('/login', (req, res, next) => {
  renderLogin(res);
});

/* POST login page */

async function checkLogin(req, settings) {
  if (settings.get('username') !== req.body.username) return false;
  return bcrypt.compare(req.body.password, settings.get('password'));
}

router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const rawSettings = await Setting.findAll({ attributes: ['key', 'value'] });
    const settings = new Map(rawSettings.map(i => [i.key, i.value]));
    if (await checkLogin(req, settings)) {
      authSession.login(req);
      res.redirect('/urls');
    } else {
      renderLogin(res, 'Your username or password was incorrect.');
    }
  } catch (err) {
    logger.error('Unable to login', err);
    renderLogin(res, 'Unable to login');
  }
});

module.exports = router;
