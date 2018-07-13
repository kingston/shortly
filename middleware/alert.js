// Allows routes to add alerts to be shown on the next screen

module.exports = (req, res, next) => {
  req.alert = {
    getMessage() {
      return req.session.alertMessage;
    },
    getType() {
      return req.session.alertType;
    },
    clear() {
      delete req.session.alertMessage;
      delete req.session.alertType;
    },
  };
  res.alert = {
    add(type, message) {
      req.session.alertType = type;
      req.session.alertMessage = message;
    },
  };
  next();
};
