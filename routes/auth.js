var express = require('express');
var router = express.Router();

/* GET initialization page */
router.get('/initialize', function(req, res, next) {
  res.render('initialize', { title: 'Initialize Shortly' });
});

/* POST initialization page */
router.post('/initialize', function(req, res, next) {
  // Always check init password first
  if (req['initialize_password'] != 'password') {
    res.render('initialize', { title: 'Initialize Shortly', err: 'Invalid init password' });
  }
  console.log(req.body);
});

/* GET login page */
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Log into Shortly' });
});

module.exports = router;
