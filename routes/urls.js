const express = require('express');
const models = require('../models');
const authSession = require('../middleware/auth_session');

const router = express.Router();
const { Url } = models;

// Require login for any URL-related route
router.use('/urls', authSession.requiresLogin);

// List URLs
router.get('/urls', (req, res, next) => {
  Url.findAll().then((urls) => {
    console.log(urls);
    const { err, success } = req.query;
    res.render('urls', { urls, err, success });
  }).catch((err) => {
    next(err);
  });
});

const invalidShorts = [
  'auth',
  'urls',
];

const shortNameRegex = /[a-z0-9]*/i;

function checkIsValidShortName(name) {
  if (typeof name !== 'string'
     || invalidShorts.includes(name)
     || !shortNameRegex.test(name)
     || name.length > 30) return new Promise(false);

  return Url.findByShortName(name).then(url => url === null);
}

function formatUrl(url) {
  try {
    // reparse URL
    return new URL(url).href;
  } catch (e) {
    return null;
  }
}

// Add new URL
router.post('/urls/new', (req, res, next) => {
  const {
    short_name: shortName,
    full_url: fullUrl,
  } = req.body;
  checkIsValidShortName(shortName).then((result) => {
    if (!result) {
      res.redirect('/urls?err=Invalid%20short%20name');
      return;
    }
    const parsedUrl = formatUrl(fullUrl);
    if (!parsedUrl) {
      res.redirect('/urls?err=Invalid%20url');
      return;
    }
    Url.create({
      short_name: shortName,
      full_url: parsedUrl,
    }).then((url) => {
      res.redirect('/urls?success=Successfully%20created!');
    }).catch((err) => {
      res.redirect('/urls?err=Error!');
    });
  }).catch((err) => {
    res.redirect('/urls?err=Error!');
  });
});

router.post('/urls/delete/:id', (req, res, next) => {
  Url.destroy({
    where: {
      id: req.params.id,
    },
  }).then((url) => {
    res.redirect('/urls?success=Deleted!');
  }).catch((err) => {
    res.redirect('/urls?err=Unable%20to%20delete!');
  });
});

// Catch all
router.get('/:key?', (req, res, next) => {
  let { key } = req.params;
  // set to nothing if empty
  if (key === undefined) key = '';
  // strip any string longer than 30 characters
  if (key.length > 30) key = key.substring(0, 30);

  Url.findByShortName(key).then((url) => {
    if (url === null) {
      next(); // pass to 404
    } else {
      res.redirect(url.full_url);
    }
  }).catch((err) => {
    next(err);
  });
});

module.exports = router;
