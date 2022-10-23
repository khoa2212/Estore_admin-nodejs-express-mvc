const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require("hbs");
const session = require("express-session");
const bodyParser = require("body-parser");

const billingRouter = require('./components/billing/billingRouter');
const dashboardRouter = require('./components/dashboard/dashboardRouter');
const profileRouter = require('./components/profile/profileRouter');
const productsRouter = require('./components/products/productsRouter');
const accountsRouter = require('./components/accounts/accountsRouter');
const authRouter = require('./components/auth/authRouter');
const passport = require("./auth/passport");
const app = express();
const redisStore = require('connect-redis')(session);
const redisClient = require('./session-store/redisClient');

//register hbs helper
hbs.registerHelper('isEquals', function(value1, value2) {return value1 === value2;});
hbs.registerHelper("listPage", function (currentPage, maxNumberOfPages, formLink, originalUrl, options) {
  let result = "";
  //calculate number of pages that need rendering
  const maxPageShown = 6;
  const numberOfPageGroups = Math.ceil(maxNumberOfPages / maxPageShown);
  let i;
  for(i = 1; i < numberOfPageGroups; i++){
    if(currentPage < maxPageShown * i + 1){
      break;
    }
  }

  //render pages
  const startPage = maxPageShown * (i - 1) + 1;
  const pageQueryAttr = formLink.substring(formLink.indexOf("?") + 1, formLink.indexOf("="));
  for(let j = startPage; j < startPage + maxPageShown; j++){
    if(j > maxNumberOfPages){
      break;
    }
    //build context (an object with attribute [isActive, productPageLink, pageNumber])
    const context = {active:"", productPageLink: getPageLink(originalUrl, pageQueryAttr, j), pageNumber: j};
    if(j === parseInt(currentPage)){
      context.active = "active";
    }

    //add context to options
    result = result + options.fn(context);
  }
  return result;
});
hbs.registerHelper("previousPageNav", function (currentPage, formLink, originalUrl, options) {
  //calculate previous page
  let prevPage;
  if(parseInt(currentPage) === 1){
    prevPage = 1;
  }
  else{
    prevPage = currentPage - 1;
  }

  //build and add context to options
  const pageQueryAttr = formLink.substring(formLink.indexOf("?") + 1, formLink.indexOf("="));
  const context = {pageLink: getPageLink(originalUrl, pageQueryAttr, prevPage)};

  return options.fn(context);
});
hbs.registerHelper("nextPageNav", function (currentPage, maxNumberOfPages, formLink, originalUrl, options) {
  //calculate next page
  let nextPage;
  if(parseInt(currentPage) === maxNumberOfPages){
    nextPage = maxNumberOfPages;
  }
  else{
    nextPage = parseInt(currentPage) + 1;
  }

  //build and add context to options
  const pageQueryAttr = formLink.substring(formLink.indexOf("?") + 1, formLink.indexOf("="));
  const context = {pageLink: getPageLink(originalUrl, pageQueryAttr, nextPage)};
  return options.fn(context);
});
function getPageLink(originalUrl, pageQueryAttr, value){
  if(originalUrl.includes(pageQueryAttr)){
    return updateQueryStringParameter(originalUrl, pageQueryAttr, value);
  }
  else{
    if(originalUrl.includes("?")){
      return originalUrl.concat("&" + pageQueryAttr + "=" + value);
    }
    else{
      return originalUrl.concat("?" + pageQueryAttr + "=" + value);
    }
  }
}
function updateQueryStringParameter(uri, key, value) {
  var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
  var separator = uri.indexOf('?') !== -1 ? "&" : "?";
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + "=" + value + '$2');
  }
  else {
    return uri + separator + key + "=" + value;
  }
}

//local variables
app.locals.activeSideBarClass = "active bg-gradient-primary";

// view engine setup
hbs.registerPartials(path.join(__dirname, 'views/partials'));
app.set('views', [__dirname + '/views/layouts'
                  ,__dirname + '/components/'
                  ,__dirname + '/components/auth/views'
                  ,__dirname + '/components/billing'
                  ,__dirname + '/components/dashboard'
                  ,__dirname + '/components/profile'
                  ,__dirname + '/components/products'
                  ,__dirname + '/components/accounts']);
app.set('view engine', 'hbs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  store: new redisStore({client: redisClient, ttl: 3600 * 24 * 30}),
  saveUninitialized: false,
  resave: false,
  secret: process.env.SESSION_SECRET
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(function (req, res, next) {
  res.locals.user = req.user;
  next();
});
app.use(function (req, res, next) {
  if(req.session.imagePath){
    res.locals.imagePath = req.session.imagePath;
  }
  next();
});
// set up router
app.use('/', authRouter);
app.use('/', checkSignedIn, dashboardRouter);
app.use('/billing', checkSignedIn, billingRouter);
app.use('/dashboard', checkSignedIn, dashboardRouter);
app.use('/profile', checkSignedIn, profileRouter);
app.use('/products', checkSignedIn, productsRouter);
app.use('/accounts', checkSignedIn, accountsRouter);

//Check if user has signed in. If not, redirect to sign in site
function checkSignedIn(req, res, next) {
  if(!res.locals.user){
    res.redirect('/signin');
  }
  else{
    next();
  }
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', {layout: 'blankLayout'});
});

module.exports = app;
