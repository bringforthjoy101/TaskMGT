var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    const entries_ret_data_data2 = Object.entries(req.session.ret_data.data);
    console.log(entries_ret_data_data2);
    res.render('pages/index', {
        title: 'Express',
        page: 'dashboardPage',
        display: 'dashboardDisplay',
        layout: 'layouts/main'
    });
});
router.get('/about', function(req, res, next) {
    console.log('This is the current session :' + req.session);
    const entries_ret_data_data = Object.entries(req.session);
    console.log(entries_ret_data_data);
    const entries_ret_data_data2 = Object.entries(req.session.ret_data.data)
    console.log(entries_ret_data_data2)
    var d = new Date();
    var viewData = {
        year: d.getFullYear(),
        testVariable: 'User Agent: ' + req.headers['user-agent'],
        title: 'About us page',
        page: 'dashboardPage',
        display: 'dashboardDisplay',
        layout: 'layouts/main'
    };
    res.render('pages/about', viewData);
});

module.exports = router;
