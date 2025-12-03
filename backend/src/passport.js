const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/User");
const Profile = require("./models/Profile");
const { buildProfileDefaults } = require("./profileDefaults");
const { getUsernameForSession, cookieKey } = require("./session");

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error(
    "*******************************************************************************"
  );
  console.error(
    "**********      GOOGLE_CLIENT_ID/SECRET not set in environment       **********"
  );
  console.error(
    "*******************************************************************************"
  );
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "placeholder_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder_secret",
      callbackURL: "/auth/google/callback",
      passReqToCallback: true,
      proxy: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // 1. Check if user is already logged in
        const sid = req.cookies[cookieKey];
        const currentUsername = sid ? getUsernameForSession(sid) : null;

        let currentUser = null;
        if (currentUsername) {
          currentUser = await User.findOne({ username: currentUsername });
        }

        // 2. Check if a user with this Google ID already exists
        let googleUser = await User.findOne({ [`auth.google`]: profile.id });

        if (currentUser) {
          // --- LINKING ACCOUNT ---
          if (googleUser) {
            if (googleUser.username === currentUser.username) {
              // Already linked to same user
              return done(null, currentUser);
            } else {
              // Linked to different user -> MERGE
              // Merge googleUser into currentUser

              // 1. Merge Profile (following list)
              const googleProfile = await Profile.findOne({
                username: googleUser.username,
              });
              const currentProfile = await Profile.findOne({
                username: currentUser.username,
              });

              if (googleProfile && currentProfile) {
                const mergedFollowing = new Set([
                  ...currentProfile.following,
                  ...googleProfile.following,
                ]);
                // Remove self from following if present
                mergedFollowing.delete(currentUser.username);

                currentProfile.following = Array.from(mergedFollowing);
                await currentProfile.save();
              }

              // 2. Delete old user and profile
              await User.deleteOne({ username: googleUser.username });
              await Profile.deleteOne({ username: googleUser.username });

              // 3. Link Google ID to current user
              if (!currentUser.auth) currentUser.auth = {};
              currentUser.auth.set("google", profile.id);
              await currentUser.save();

              return done(null, currentUser);
            }
          } else {
            // Google ID not used yet -> Just Link
            if (!currentUser.auth) currentUser.auth = {};
            currentUser.auth.set("google", profile.id);
            await currentUser.save();
            return done(null, currentUser);
          }
        } else {
          // --- LOGIN / REGISTER ---
          if (googleUser) {
            return done(null, googleUser);
          }

          // Create new user
          let username = profile.emails[0].value.split("@")[0];

          // Check if username exists
          const existingUser = await User.findOne({ username });

          if (existingUser) {
            // If username exists, append google id
            username = `${username}_google_${profile.id}`;
          }

          const newUser = await User.create({
            username,
            auth: { google: profile.id },
          });
          await Profile.create(buildProfileDefaults(username));
          return done(null, newUser);
        }
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.username);
});

passport.deserializeUser(async (username, done) => {
  const user = await User.findOne({ username });
  done(null, user);
});

module.exports = passport;
