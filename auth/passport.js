const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const {models} = require("../models");
const users = models.users;
const bcrypt = require("bcrypt");


passport.use(new LocalStrategy({usernameField: 'email', passwordField: 'password'},
    async function(username, password, done) {
        try {
            const user = await users.findOne({raw:true, where: {EMAIL: username, LA_ADMIN: true, KHOA: false}});
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }

            const valid = await validPassword(user, password);
            if (!valid) {
                return done(null, false, { message: 'Incorrect password.' });
            }

            return done(null, user);
        }
        catch (err) {
            return done(err);
        }
    })
);

async function validPassword(user, password) {
    return await bcrypt.compare(password, user.PASS);
}

passport.serializeUser(function(user, done) {
    done(null, user.USER_ID);
});

passport.deserializeUser(async function(id, done) {
    try {
        const user = await users.findOne({raw:true, where: {USER_ID: id}});
        return done(null, user);
    }
    catch (err) {
        return done(err);
    }
});

module.exports = passport;