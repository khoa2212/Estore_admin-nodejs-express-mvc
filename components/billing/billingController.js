exports.showPage = (req, res) => {
    res.render('billing', { title: 'Billing', billingActive: req.app.locals.activeSideBarClass });
}