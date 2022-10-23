const {models, sequelize} = require('../../models/index');
const users = models.users;
const { Op, where} = require("sequelize");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const salt = Number(process.env.BCRYPT_SALT);

exports.countTotalUsers = async () =>{
    return await users.count({where: {KICH_HOAT: true}}).catch((err) => {throw err});
};

exports.countUsersOfName = async (name) => {
    return await users.count({
        where: {
            KICH_HOAT: true,
            [Op.or]: [
                {HO: {[Op.substring]: name}},
                {TEN: {[Op.substring]: name}}
            ]
        }
    }).catch((err) => {throw err});
};

exports.listUsersOfName = async (itemPerPage =6, page=0, name) =>
{
    return await users.findAll({
        offset: page * itemPerPage,
        limit: itemPerPage,
        attribute: ['TEN', 'HO', 'EMAIL', 'LA_ADMIN', 'KHOA'],
        raw:true,
        where: {
            KICH_HOAT: true,
            [Op.or]: [
                {HO: {[Op.substring]: name}},
                {TEN: {[Op.substring]: name}}
            ]
        }
    }).catch((err)=>{throw err});
};

exports.listUsers = async (itemPerPage =6, page=0) =>
{
    return await users.findAll({
        offset: page * itemPerPage,
        limit: itemPerPage,
        where: {KICH_HOAT: true},
        attribute: ['TEN', 'HO', 'EMAIL', 'LA_ADMIN', 'KHOA'],
        raw:true
    }).catch((err)=>{throw err});
};

exports.getUserWithToken = async (id, token, isActive) => {
    const user = await users.findOne({
        raw: true,
        where:{
            [Op.and]: [
                {USER_ID: id},
                {KICH_HOAT: isActive},
                sequelize.where(
                    sequelize.fn('TIMESTAMPDIFF', sequelize.literal('SECOND'), sequelize.fn('NOW'), sequelize.col('NGAY_HET_HAN_TOKEN')),
                    {[Op.gt]: 0}
                )
            ]
        }
    });

    if(user) {
        const isValidToken = bcrypt.compare(token, user.TOKEN);
        if (isValidToken) {
            return user;
        }
    }
    return null;
};

exports.getUserWithEmail = async (email, isActive) => {
    return await users.findOne({
        raw: true,
        where: {EMAIL: email, KICH_HOAT: isActive}
    });
};

exports.getUserWithId = async (id, isActive) => {
    return await users.findOne({
        where: {USER_ID: id, KICH_HOAT: isActive}
    });
}

exports.setNewTokenForUser = async (id, expireHours = 24) => {
    let expires = new Date();
    expires.setHours(expires.getHours() + expireHours);
    const expiresStr = expires.toISOString();
    const token = crypto.randomBytes(64).toString('hex');
    const hashedToken = await bcrypt.hash(token, salt);

    try {
        await users.update({TOKEN: hashedToken, NGAY_HET_HAN_TOKEN: expiresStr}, {where: {USER_ID: id}});
        return token;
    }
    catch (err){
        throw err;
    }
}

exports.changePassword = async (id, password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, salt);
        await users.update({PASS: hashedPassword}, {where: {USER_ID: id}});
    }
    catch (err){
        throw err;
    }
}

exports.updateUserLockStatus = async (id, lockStatus) => {
    try {
        await users.update({KHOA: lockStatus}, {where: {USER_ID: id}});
    }
    catch (err){
        throw err;
    }
}

exports.changeUserProfile = async (id, ho, ten, banking) => {
    try {
        await users.update({HO: ho, TEN: ten, SO_BANKING: banking}, {where: {USER_ID: id}});
    }
    catch (err){
        throw err;
    }
}
