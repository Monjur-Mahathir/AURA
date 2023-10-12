const LocalStrategy = require('passport-local').Strategy;

// Load User model
const Personal = require('./../models/Personal.js');
const bcrypt = require('bcryptjs')

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'userid' }, async(userid, password, done) => {
      // Match user
      const user = await Personal.findOne({userid: userid});
      const validPass = await bcrypt.compare(password, user.password);
    
      if (!user || !validPass) {
        return done(null, false, { message: 'User Id or password does not match' });
      }
      else{
        return done(null, user);
      }
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    Personal.findById(id, function(err, user) {
      done(err, user);
    });
  });
};
