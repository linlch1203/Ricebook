const md5 = require("md5");

const sessionUsers = {};
const cookieKey = "sid";

const getSecret = () => process.env.SESSION_SECRET || "ricebook-secret";

const createSession = (username) => {
  const sid = md5(`${getSecret()}-${Date.now()}-${username}`);
  sessionUsers[sid] = username;
  return sid;
};

const getUsernameForSession = (sid) => sessionUsers[sid];

const removeSession = (sid) => {
  if (sid && sessionUsers[sid]) {
    delete sessionUsers[sid];
  }
};

module.exports = {
  sessionUsers,
  cookieKey,
  createSession,
  getUsernameForSession,
  removeSession,
};
