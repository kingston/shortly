const express = require('express');
const models = require('../models');

const router = express.Router();
const { Url } = models;

router.get('/', (req, res, next) => {
  Url.findAll({ attributes: ['short_name', 'full_url'] }).then(
    //
  );
});
