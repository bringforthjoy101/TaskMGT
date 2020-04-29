var express = require('express');
var router = express.Router();
var auth = require('./../modules/auth');

router.get('/', function(req, res, next) {
    const entries_ret_data_data2 = Object.entries(req.session.ret_data.data)
    console.log(entries_ret_data_data2)
    var viewData = {
        title: 'Login page',
        layout: 'layouts/main'
    }
    res.render('pages/loginMain', viewData);
});

// router.post('/', function(req, res, next) {
//     var passport = req.app.get('passport');
//     passport.authenticate('local', { failureRedirect: '/login?f=1', successRedirect: '/dashboard' });
// });

router.post('/signup', function(req, res, next) {
    const entries_ret_data_data2 = Object.entries(req.session.ret_data.data)
    console.log(entries_ret_data_data2)
    auth.createUser(req, res, function(data) {
        var viewData = {
            title: 'Signup page',
            message: data.message,
            layout: 'layouts/main'
        }
        res.render('pages/loginSignup', viewData);
    });
});

module.exports = router;
