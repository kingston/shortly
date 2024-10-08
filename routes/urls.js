const express = require('express');
const fileUpload = require('express-fileupload');
const shortid = require('shortid');
const fs = require('fs');
const util = require('util');
const csrf = require('csurf');
const { URL } = require('url');
const models = require('../models');
const authSession = require('../middleware/auth_session');
const alert = require('../middleware/alert');
const logger = require('../config/winston');

const router = express.Router();
const { Url } = models;

const csrfProtection = csrf();
const uploadOptions = {
  safeFileNames: false,
  abortOnLimit: true,
  limits: { fileSize: 200 * 1024 * 1024 },
};

router.use('/urls/new', fileUpload(uploadOptions));

// Require login and alert for any URL-related route
router.use('/urls', authSession.requiresLogin);
router.use('/urls', csrfProtection);
router.use('/urls', alert);

// List URLs
router.get('/urls', async (req, res, next) => {
  try {
    const urls = await Url.findAll();
    const alertType = req.alert.getType();
    const alertMessage = req.alert.getMessage();
    const csrfToken = req.csrfToken();
    await res.alert.clear();
    res.render('urls', {
      urls,
      alertType,
      alertMessage,
      csrfToken,
      title: 'Shortly URLs',
    });
  } catch (err) {
    logger.error('Unable to list URLs', err);
    next(err);
  }
});

async function redirectToList(res, type, message) {
  await res.alert.add(type, message);
  res.redirect('/urls');
}

const invalidShorts = [
  'auth',
  'urls',
  'public',
];

const shortNameRegex = /[a-z0-9]*/i;

async function checkIsValidShortName(name) {
  if (typeof name !== 'string'
     || invalidShorts.includes(name)
     || !shortNameRegex.test(name)
     || name.length > 30) return false;

  return (await Url.findByShortName(name)) === null;
}

const urlPrefix = /^[a-z^:]+:/i;

function formatUrl(url) {
  try {
    let newUrl = url;
    if (!url.match(urlPrefix)) {
      newUrl = `https://${url}`;
    }
    // reparse URL
    return new URL(newUrl).href;
  } catch (e) {
    return null;
  }
}

const uploadDirectory = `${__dirname}/../uploads`;

// Add new URL
router.post('/urls/new', async (req, res, next) => {
  let uploadedPath;
  try {
    const {
      short_name: shortName,
      full_url: fullUrl,
    } = req.body;
    if (!await checkIsValidShortName(shortName)) {
      await redirectToList(res, 'error', 'Invalid short name');
      return;
    }

    const urlParams = { shortName };

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
      urlParams.fileLocation = newFilename;
      urlParams.fileName = attachment.name;
    } else {
      urlParams.fullUrl = formatUrl(fullUrl);
      if (!urlParams.fullUrl) {
        await redirectToList(res, 'error', 'Invalid URL');
        return;
      }
    }
    await Url.create(urlParams);
    await redirectToList(res, 'success', 'Successfully created URL!');
  } catch (err) {
    logger.err('Unable to add URL', err);
    if (uploadedPath) {
      try {
        await util.promisify(fs.unlink)(uploadedPath);
      } catch (unlinkErr) {
        // ignore
      }
    }
    await redirectToList(res, 'error', 'Unable to add URL!');
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
    if (url.fileName) {
      await util.promisify(fs.unlink)(`${uploadDirectory}/${url.fileLocation}`);
    }
    await redirectToList(res, 'success', 'Deleted URL!');
  } catch (err) {
    logger.error('Unable to delete URL', err);
    await redirectToList(res, 'error', 'Unable to delete URL!');
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
    } else if (url.fileLocation) {
      res.download(
        `${uploadDirectory}/${url.fileLocation}`,
        url.fileName,
      );
    } else {
      res.redirect(url.fullUrl);
    }
  }).catch((err) => {
    logger.error('Unable to find URL by short name', err);
    next(err);
  });
});

module.exports = router;
