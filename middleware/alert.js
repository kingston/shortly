// Allows routes to add alerts to be shown on the next screen
const util = require('util');

module.exports = (req, res, next) => {
  req.alert = {
    getMessage() {
      return req.session.alertMessage;
    },
    getType() {
      return req.session.alertType;
    },
  };
  res.alert = {
    async add(type, message) {
      req.session.alertType = type;
      req.session.alertMessage = message;
      await util.promisify(callback => req.session.save(callback))();
    },
    async clear() {
      delete req.session.alertMessage;
      delete req.session.alertType;
    },
  };
  next();
};
