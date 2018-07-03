var express = require('express');
var router = express.Router();
const models = require('../models');
const Setting = models.Setting;

let requiresEmptySettings = (req, res, next) => {
  Setting.findAll().then(settings => {
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
  models.sequelize.transaction(t =>
    Setting.create({
      key: "username",
      value: username
    }, {transaction: t}).then(s =>
      Setting.create({
        key: "password",
        value: password
    }, {transaction: t})).then(s =>
      Setting.create({
        key: "website_url",
        value: website_url
    }, {transaction: t}))
  ).then(result => {
    res.redirect('/auth/login');
  }).catch(err => {
    renderInitialize(res, "Error setting up database!");
  })
  console.log(req.body);
});

/* GET login page */
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Log into Shortly' });
});

module.exports = router;
