const {models} = require("../../models");
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const users = models.users;
const salt = Number(process.env.BCRYPT_SALT);

//Register a new user (temporarily). User still needs to activate account from his email.
exports.registerUser = async (firstName, lastName, email, password) => {
    //check if email is registered
    const Account = await users.findOne({where: {EMAIL: email, LA_ADMIN: true}});
    if(Account) {
        throw {name: "Email has been registered", message: "Email has already been registered."};
    }

    //prepare attributes
    const hashedPass = await bcrypt.hash(password, salt);
    let expireDate = new Date();
    expireDate.setHours(expireDate.getHours() + 24); //token will expire after 24 hours
    const expireDateString = expireDate.toISOString();
    const token = crypto.randomBytes(64).toString('hex');
    const hashedToken = await bcrypt.hash(token, salt);

    //create new account
    const user = await users.create({TEN: firstName, HO: lastName, EMAIL: email, PASS: hashedPass, LA_ADMIN: true,
                            TOKEN: hashedToken, NGAY_HET_HAN_TOKEN: expireDateString});

    return {user, token};
};

exports.activateUser = async (id) => {
    try {
        await users.update({KICH_HOAT: true}, {where: {USER_ID: id}});
    }
    catch (err){
        throw err;
    }
}