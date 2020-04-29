var express = require('express');
var router = express.Router();
var dbLayer = require('../modules/dbLayer');

router.get('/', function(req, res, next) {
    // const entries_ret_data_data2 = Object.entries(req.session.ret_data.data)
    // console.log(entries_ret_data_data2)
    var User = dbLayer.user;
    User.findAll().then(function(users) {
        var viewData = {
            title: 'Main admin page',
            adminContents: 'This is main admin page',
            users: users,
            user: req.user,
            page: 'adminPage',
            display: 'adminDisplay',
            layout: 'layouts/main'
        }
        res.render('pages/adminMain', viewData);
    });
});

router.get('/setup', function(req, res, next) {
    var viewData = {
        title: 'Setup admin page',
        layout: 'layouts/main'
    }
    res.render('pages/adminSetup', viewData);
});

module.exports = router;
