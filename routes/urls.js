const express = require('express');
const models = require('../models');

const router = express.Router();
const { Url } = models;

// Useful attributes
const urlAttributes = [
  'short_name',
  'full_url',
  'file_location',
  'file_name',
];

// List URLs
router.get('/urls', (req, res, next) => {
  Url.findAll({ attributes: urlAttributes }).then((urls) => {
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

const shortNameRegex = /[a-z0-9]+/i;

function isValidShortName(name) {
  return typeof name === 'string'
         && !invalidShorts.includes(name)
         && shortNameRegex.test(name)
         && name.length < 30;
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
  if (!isValidShortName(shortName)) {
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
  });
});

// Catch all
router.get('/:key?', (req, res, next) => {
  let { key } = req.params;
  // set to nothing if empty
  if (key === undefined) key = '';
  // strip any string longer than 30 characters
  if (key.length > 30) key = key.substring(0, 30);

  Url.findOne({
    attributes: urlAttributes,
    where: {
      short_name: key,
    },
  }).then((url) => {
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
