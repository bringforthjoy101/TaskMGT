var express = require('express');
var path = require('path');
// var favicon = require('serve-favicon');
var logger = require('morgan');
var flash = require('express-flash-notification');
var bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
// var hbs = require('hbs');
var passport = require('passport');
var auth = require('./modules/auth.js');
var ejsLayouts = require('express-ejs-layouts');

var env = process.env.NODE_ENV || 'development',
    config = require('./config/config.' + env);

var index = require('./routes/index');
var user = require('./routes/user');
var login = require('./routes/login');
var siteAdmin = require('./routes/siteAdmin');
var todo = require('./routes/todo');
var todoAPIRouter = require('./routes/api/todo');
// var blog  = require('./routes/blog');
var tools = require('./modules/tools');
var sessionManagement = require('./modules/sessionManagement');

// var createError = require('http-errors');
// var catalogRouter = require('./routes/catalog');  //Import routes for "catalog" -  internal area of site i.e views
// var catalogAPIRouter = require('./routes/api/catalog');  //Import routes for "catalog" API - external frontend or collaboration


var compression = require('compression');
var helmet = require('helmet');


var app = express();
var sessionStore = new session.MemoryStore;

//
// EJS Template / EJS setup and configuration
//

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout', 'layouts/main');
app.use(ejsLayouts);

//
// App level variables initialization
//
// value to play with on request start and end
app.set('executionsThisTime', 0);
app.set('config', config);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
// app.use(expressValidator());
app.use(cookieParser('secret'));
app.use(require('express-session')({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));
app.use(session({cookie: { maxAge: 60000 }, secret: 'secret', saveUninitialized: false, resave: false, store: sessionStore,}));
app.use(flash());
// Custom flash middleware -- from Ethan Brown's book, 'Web Development with Node & Express'
app.use(function(req, res, next){
  // if there's a flash message in the session request, make it available in the response, then delete it
  res.locals.sessionFlash = req.session.sessionFlash;
  delete req.session.sessionFlash;
  next();
});

app.use(function(req, res, next){
  // if there's a flash message in the session request, make it available in the response, then delete it
  res.locals.sessionValidate = req.session.sessionValidate;
  delete req.session.sessionValidate;
  next();
});

app.use(helmet());
app.use(compression()); // Compress all routes

app.use(express.static(path.join(__dirname, 'public')));

// session will not work for static content
app.set('trust proxy', 1) // trust first proxy
app.use(sessionManagement);
// passport initialization
auth.initializeStrategy(passport);
app.use(passport.initialize());
app.use(passport.session())
app.set('passport', passport);

//
// General toolset
//
// on request start and on request end moved after static content
app.use(tools.onRequestStart);
app.use(tools.onRequestEnd);
// generate menu of the application
app.use(tools.generateMainMenu);
app.use('/user', tools.generateUserMenu);

const isWhiteListed = ( path, whiteList = [ 'login', 'autoLogin' ] ) => {
    let whiteListed = false;
    for(let i=0; i < whiteList.length; i++) {
        // this won't check authentication for login and autoLogin
        // add logic here if you want to check POST or GET method in login
        if( path.indexOf( whiteList[ i ] ) !== -1 ) {
            whiteListed = true;
        }
    }
    return whiteListed;
};

const authenticationMiddleware = (req, res, next) => {
    if( isWhiteListed(req.originalUrl) || req.isAuthenticated() ) {
        return next();
    }

    res.redirect('https://manifestusermodule.herokuapp.com/login');
};
app.use( authenticationMiddleware );

var authentication = require('./modules/authentication');


// Manually login
app.post('/login',
    passport.authenticate('local', {
        failureRedirect: '/login'
    }),
    function(req, res) {
        res.redirect('/todo');
    });

// Auto login
app.post('/autoLogin',
   authentication(),
    function(req, res) {
        res.redirect('/todo');
    });

app.get('/logout',
    function(req, res) {
        req.logout();
        res.redirect('/');
    });

//
// routing
//
app.use('/', index);

// app.use('/catalog', catalogRouter);  // Add catalog routes to middleware chain.
// app.use('/api/catalog', catalogAPIRouter);  // Add catalog routes to middleware chain.

app.use('/user', function(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login?m=not-logged-in');
    }
});

app.use('/todo', function(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login?m=not-logged-in');
    }
});

app.use('/api/todo', todoAPIRouter);  // Add todo routes to middleware chain.

app.use('/user', function(req, res, next) {
    res.locals.layout = 'layout_user';
    next();
});
app.use('/user', user);
app.use('/siteAdmin', siteAdmin);
app.use('/login', login);
app.use('/todo', todo);
// app.use('/blog', blog);




// error handling
//
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    // err.message = err;
    err.status = 404;
    next(err);
});

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('pages/error', {
        title: 'Non Controller Function Error',
        fileLocation: 'Check Views or redirection path)',
        error: err,
        user: req.user,
        page: 'errorPage',
        display: 'dashboardDisplay',
        message: err.message,
        layout: 'layouts/detail'
    });
});



 

module.exports = app;
