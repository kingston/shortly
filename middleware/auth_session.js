const authSession = {};

authSession.requiresLogin = (req, res, next) => {
  if (!req.session.loggedIn) {
    res.redirect('/auth/login');
  } else {
    next();
  }
};

authSession.login = (req) => {
  req.session.loggedIn = true;
};

authSession.logout = (req) => {
  req.session.destroy();
};

module.exports = authSession;
