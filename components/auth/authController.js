const authService = require('./authService');
const mailService = require('../mail/mailService');
const accountsService = require('../accounts/accountsService');

exports.logout = (req, res) => {
    req.logout();
    res.redirect('/');
}

exports.showForgetPasswordPage = (req, res) => {
    res.render('forgetPassword', {layout: 'blankLayout'});
}

exports.showSignInPage = (req, res) => {
    res.render('signin', { title: 'Sign in', layout: "signLayout", signInFail: req.query.signInFail !== undefined});
}

exports.showSignUpPage = (req, res) => {
    res.render('signup', { title: 'Sign Up', layout: "signLayout" });
}

exports.signUpNewUser = async (req, res) => {
    const {firstName, lastName, email, password, confirmPassword, agreeWithTerms} = req.body;

    if(!email || !password || !firstName || !lastName || !confirmPassword){ //Check if user has input all info needed
        res.render('signup', {missingInfo: true, layout: 'signLayout'});
    }
    else if(agreeWithTerms === undefined){
        res.render('signup', {termsDisagree: true, layout: 'signLayout'});
    }
    else if(password !== confirmPassword){
        res.render('signup', {differentPassword: true, layout: 'signLayout'});
    }
    else{   //All info has been filled and password valid
        try{
            let deliverable = false;
            mailService.checkEmailDeliverability(email, async function(result){
                deliverable = result;
                if (!deliverable) { //cannot send mail there
                    res.render('signup', {emailInvalid: true, layout: 'signLayout'});
                }
                else { //activation mail can be sent
                    const {user, token} = await authService.registerUser(firstName, lastName, email, password);
                    await mailService.sendActivationMail(user.EMAIL, user.TEN, token, user.USER_ID);
                    res.render('activationMailSent', {email: user.EMAIL, layout: 'blankLayout'});
                }
            });
        }
        catch (err) {
            if(err.name === 'Email has been registered'){
                res.render('signup', {alreadyRegistered: true, layout: 'signLayout'});
            }
            else if(err.name === 'Unsupported Email Service'){
                res.render('activateResult', {layout: 'blankLayout', success: false});
            }
            else{
                res.render('error', {error: err, layout: 'blankLayout'});
            }
        }
    }
}

exports.activateAccount = async (req, res) => {
    const token = req.query.token;
    const userId = req.query.id;

    try{
        //get user with token and still has not expired
        const user = await accountsService.getUserWithToken(userId, token, false);

        if (user) {
            await authService.activateUser(user.USER_ID);
            res.render('activateResult', {layout: 'blankLayout', success: true});
        }
        else { //cannot find user with valid tokens
            res.render('activateResult', {layout: 'blankLayout', success: false});
        }
    }
    catch (err){
        res.render('error', {error: err, layout: 'blankLayout'});
    }
}

exports.sendResetPasswordMail = async (req, res) => {
    const email = req.body.email;
    const user = await accountsService.getUserWithEmail(email, true);

    if(user){   //found legit user
        try {
            const token = await accountsService.setNewTokenForUser(user.USER_ID, 1);
            await mailService.sendResetPasswordMail(email, user.TEN, token, user.USER_ID);

            res.render('forgetPassword', {layout: 'blankLayout', emailSent: user.EMAIL});
        }
        catch (err) {
            res.render('error', {error: err, layout: 'blankLayout'});
        }
    }
    else{   //cannot found user with email provided
        res.render('resetPasswordFailed', {layout: 'blankLayout'});
    }
}

exports.resetPassword = async (req, res) => {
    const id = req.query.id;
    const token = req.query.token;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const validPass = (password === confirmPassword);
    const user = await accountsService.getUserWithToken(id, token, true);

    if (!validPass) {
        res.render('resetPassword', {layout: 'blankLayout', differentPass: true});
    } else if (!user) {
        res.render('resetPassResult', {layout: 'blankLayout', success: false});
    } else {
        try {
            await accountsService.changePassword(id, password);
            res.render('resetPassResult', {layout: 'blankLayout', success: true});
        }
        catch (err){
            res.render('resetPassResult', {layout: 'blankLayout', success: false});
        }
    }
}

exports.showResetPasswordPage = (req, res) => {
    const id = req.query.id;
    const token = req.query.token;
    const user = accountsService.getUserWithToken(id, token, true);

    if(user){   //found legit user
        res.render('resetPassword', {layout: 'blankLayout'});
    }
    else{   //user cannot be found
        res.render('resetPassResult', {layout: 'blankLayout', success: false});
    }
}