exports.showPage = (req, res) => {
    res.render('dashboard', { title: 'Admin Dashboard', dashboardActive: req.app.locals.activeSideBarClass });
}