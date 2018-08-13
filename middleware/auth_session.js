const util = require('util');

const authSession = {};

authSession.requiresLogin = (req, res, next) => {
  if (!req.session.loggedIn) {
    res.redirect('/auth/login');
  } else {
    next();
  }
};

authSession.login = async (req) => {
  req.session.loggedIn = true;
  await util.promisify(callback => req.session.save(callback))();
};

authSession.logout = async (req) => {
  await util.promisify(callback => req.session.destroy(callback))();
};

module.exports = authSession;
