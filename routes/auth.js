var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
const models = require('../models');
const Setting = models.Setting;

let requiresEmptySettings = (req, res, next) => {
  Setting.findAll({attributes: ['id']}).then(settings => {
    if (settings.length > 0) {
      err = new Error("App has already been initialized");
      next(err);
    }
    next();
  });
}

let renderInitialize = (res, err = null) => {
  res.render('initialize', { title: 'Initialize Shortly', err: err});
}

/* GET initialization page */
router.get('/initialize', requiresEmptySettings, function(req, res, next) {
    renderInitialize(res);
});

/* POST initialization page */
router.post('/initialize', requiresEmptySettings, function(req, res, next) {
  // Always check init password first
  const {username, password, website_url, initialize_password} = req.body;
  if (initialize_password != 'password') {
    renderInitialize(res, 'Invalid admin password');
  }

  // Initialize settings
  bcrypt.hash(password, 10).then((hash) =>
    models.sequelize.transaction(t =>
      Setting.create({
        key: "username",
        value: username
      }, {transaction: t}).then(s =>
        Setting.create({
          key: "password",
          value: hash
      }, {transaction: t})).then(s =>
        Setting.create({
          key: "website_url",
          value: website_url
      }, {transaction: t}))
    )
  ).then(result => {
    res.redirect('/auth/login');
  }).catch((err) => {
    renderInitialize(res, "Error setting up database!");
  });
});
let renderLogin = (res, err = null) => {
  res.render('login', { title: 'Log into Shortly', err: err});
}

/* GET login page */
router.get('/login', function(req, res, next) {
  renderLogin(res);
});

/* POST login page */

let checkLogin = (req, settings) => {
  if (settings.get('username') !== req.body.username) return false;
  return bcrypt.compare(req.body.password, settings.get('password'));
}

router.post('/login', function(req, res, next) {
  Setting.findAll({attributes: ['key', 'value']}).then(rawSettings => {
    let settings = new Map(rawSettings.map(i => [i.key, i.value]));
    return checkLogin(req, settings);
  }).then(isValid => {
    if (isValid) {
      res.redirect('/urls');
    } else {
      renderLogin(res, "Your username or password was incorrect.");
    }
  }).catch(err => {
    renderLogin(res, "Unable to login");
  })
});

module.exports = router;
