const express = require('express');
const fileUpload = require('express-fileupload');
const shortid = require('shortid');
const fs = require('fs');
const util = require('util');
const models = require('../models');
const authSession = require('../middleware/auth_session');


const router = express.Router();
const { Url } = models;

// Require login for any URL-related route
router.use('/urls', authSession.requiresLogin);

// List URLs
router.get('/urls', (req, res, next) => {
  Url.findAll().then((urls) => {
    const { err, success } = req.query;
    res.render('urls', { urls, err, success });
  }).catch((err) => {
    next(err);
  });
});

const invalidShorts = [
  'auth',
  'urls',
  'public',
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

const uploadDirectory = `${__dirname}/../uploads`;
const uploadOptions = {
  safeFileNames: false,
  abortOnLimit: true,
  limits: { fileSize: 200 * 1024 * 1024 },
};

// Add new URL
router.post('/urls/new', fileUpload(uploadOptions), async (req, res, next) => {
  let uploadedPath;
  try {
    const {
      short_name: shortName,
      full_url: fullUrl,
    } = req.body;
    if (!await checkIsValidShortName(shortName)) {
      res.redirect('/urls?err=Invalid%20short%20name');
      return;
    }

    const urlParams = { short_name: shortName };

    if (req.files && req.files.attachment) {
      const { attachment } = req.files;
      const newFilename = shortid.generate();
      try {
        await util.promisify(fs.mkdir)(uploadDirectory);
      } catch (ex) {
        // ignore mkdir if already exists
      }
      uploadedPath = `${uploadDirectory}/${newFilename}`;
      await attachment.mv(uploadedPath);
      urlParams.file_location = newFilename;
      urlParams.file_name = attachment.name;
    } else {
      urlParams.full_url = formatUrl(fullUrl);
      if (!urlParams.full_url) {
        res.redirect('/urls?err=Invalid%20url');
        return;
      }
    }
    await Url.create(urlParams);
    res.redirect('/urls?success=Successfully%20created!');
  } catch (err) {
    console.log(err);
    if (uploadedPath) {
      try {
        await util.promisify(fs.unlink)(uploadedPath);
      } catch (unlinkErr) {
        // ignore
      }
    }
    res.redirect(`/urls?err=${err.toString()}`);
  }
});

router.post('/urls/delete/:id', async (req, res, next) => {
  try {
    const url = await Url.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!url) throw new Error('Unable to find URL by ID');
    await url.destroy();
    await util.promisify(fs.unlink)(`${uploadDirectory}/${url.file_name}`);
    res.redirect('/urls?success=Deleted!');
  } catch (err) {
    console.log(err);
    res.redirect('/urls?err=Unable%20to%20delete!');
  }
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
    } else if (url.file_location) {
      res.download(
        `${uploadDirectory}/${url.file_location}`,
        url.file_name,
      );
    } else {
      res.redirect(url.full_url);
    }
  }).catch((err) => {
    next(err);
  });
});

module.exports = router;
