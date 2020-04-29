var express = require('express');
var router = express.Router();
var tools = require('./../modules/tools');

router.get('/', function(req, res, next) {
    console.log('I am in function user');
    const entries_ret_data_data2 = Object.entries(req.session.ret_data.data)
    console.log(entries_ret_data_data2)
    var viewData = {
        title: 'Main user page',
        userContents: 'This is main user page - it should use different layout',
        startDate: tools.convertMillisecondsToStringDate(req.session.startDate),
        endDate: tools.convertMillisecondsToStringDate(req.session.lastRequestDate),
        user: req.user,
        page: 'dashboardPage',
        display: 'dashboardDisplay',
        layout: 'layouts/main'
    }
    res.render('pages/userMain', viewData);
});

module.exports = router;
