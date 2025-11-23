const { cookieKey, getUsernameForSession } = require("../session");

const isLoggedIn = (req, res, next) => {
  if (!req.cookies) {
    return res.sendStatus(401);
  }

  const sid = req.cookies[cookieKey];
  if (!sid) {
    return res.sendStatus(401);
  }

  const username = getUsernameForSession(sid);
  if (!username) {
    return res.sendStatus(401);
  }

  req.username = username;
  req.sid = sid;
  return next();
};

module.exports = isLoggedIn;
