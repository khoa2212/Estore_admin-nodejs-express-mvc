const accountsService = require("../accounts/accountsService");

exports.changeProfileInfo = async (req, res) => {
    const ho = req.body.newLastName;
    const ten = req.body.newFirstName;
    const banking = req.body.newBank;
    const id = req.body.uid;

    try {
        await accountsService.changeUserProfile(id, ho, ten, banking);
        req.session['changeProfileSuccess'] = true;
        res.redirect('back');
    }
    catch (error){
        req.session['changeProfileFail'] = true;
        res.redirect('back');
    }
}

exports.showPage = (req, res) => {
    const changeProfileSuccess = req.session.changeProfileSuccess;
    const changeProfileFail = req.session.changeProfileFail;

    res.render('profile', {title: 'Profile', profileActive: req.app.locals.activeSideBarClass,
            changeProfileSuccess, changeProfileFail});

    req.session['changeProfileSuccess'] = false;
    req.session['changeProfileFail'] = false;
}