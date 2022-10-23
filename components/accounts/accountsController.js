const accountsService = require('./accountsService');
const itemPerPage = 12;

exports.showPage = async (req, res) => {
    try {
        //validate info from query string
        let page = req.query.page;
        if(isNaN(page) || page <= 0 || page == null){
            page = 1;
        }
        let name = req.query.name;
        const originalUrl = req.originalUrl;

        //choose service
        let users;
        let maxNumberOfPages;
        if(name){
            maxNumberOfPages = Math.ceil(await accountsService.countUsersOfName(name) / itemPerPage);
            users = await accountsService.listUsersOfName(itemPerPage, page - 1, name);
        }
        else{
            maxNumberOfPages = Math.ceil(await accountsService.countTotalUsers() / itemPerPage);
            users = await accountsService.listUsers(itemPerPage,page - 1);
        }

        //pass data to view and render
        const paginateInfo = {page, maxNumberOfPages, originalUrl, formLink: '/accounts?page='};
        const cannotLockYourOwnAccount = req.session.cannotLockYourOwnAccount;
        const cannotLock = req.session.cannotLock;
        const cannotUnlock = req.session.cannotUnlock;

        //reset session parameters
        req.session['cannotLockYourOwnAccount'] = false;
        req.session['cannotLock'] = false;
        req.session['cannotUnlock'] = false;

        res.render('accounts', {title: "Accounts Table", users,
            accountsActive: req.app.locals.activeSideBarClass,
            paginateInfo,
            cannotLockYourOwnAccount, cannotLock, cannotUnlock});
    }
    catch (err) {
        res.render('error', {err});
    }
}

exports.lockOrUnlockUser = async (req, res) => {
    const userId = req.body.userId;
    const currentAdmin = res.locals.user;

    //Không cho phép khóa tài khoản của chính mình
    if(currentAdmin.USER_ID === userId){
        req.session['cannotLockYourOwnAccount'] = true;
        res.redirect('back');
    }
    else{
        if(req.body.lockButton){
            try{
                await accountsService.updateUserLockStatus(userId, false);
            }
            catch (err){
                req.session['cannotLock'] = true;
                res.redirect('back');
            }
        }
        else if(req.body.unlockButton){
            try{
                await accountsService.updateUserLockStatus(userId, true);
            }
            catch (err){
                req.session['cannotUnlock'] = true;
                res.redirect('back');
            }
        }
        res.redirect('back');
    }
}