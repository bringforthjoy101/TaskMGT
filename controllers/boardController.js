var models = require('../models');
var moment = require('moment');
const { check, validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');

// Display author create form on GET.
exports.index = function(req, res, next) {
    
    console.log('I am in todo Dashboard');
    
    models.Board.findAndCountAll(
        ).then(function(boardCount)
        {
          models.Team.findAndCountAll(
        ).then(function(teamCount)
        {
        //   models.Task.findAndCountAll(
        // ).then(function(taskCount)
        // {
          models.user.findAndCountAll(
        ).then(function(userCount)
        {
   
          res.render('pages/index', {
              title: 'Homepage', 
              page: 'dashboardPage1',
              display: 'dashboardDisplay1',
              boardCount: boardCount, 
              teamCount: teamCount,
              user: req.user,
            //   taskCount: taskCount,
              userCount: userCount,
              layout: 'layouts/main'
              
          });
          
          // res.render('pages/index_list_sample', { title: 'Post Details', layout: 'layouts/list'});
          // res.render('pages/index_detail_sample', { page: 'Home' , title: 'Post Details', layout: 'layouts/detail'});
        });
        // });
        });
        });
};

exports.board_create_get = 
    function (req, res, next) {
    var displayData = {
                title: 'Create Board',
                page: 'boardPage',
                display: 'boardCreate',
                layout: 'layouts/detail' 
    };
    res.render('pages/content', displayData);
};

// Handle board create on POST.
exports.board_create_post = [
    
    // fields Validtion
    check('board_name')
    .not().isEmpty().withMessage('Board Name is required')
    .isLength({ min: 2 }).withMessage('Board Name must be at least 2 chars long')
    .custom(value => { return models.Board.findOne({ where: { board_name: value } })
    .then(board => { if (board) { return Promise.reject('Board Name Already Exists'); } }); }),
    check('employee_id')
    .not().isEmpty().withMessage('Employee is required'),
    
    // Fields Sanitization
    sanitizeBody('board_name').escape(),
    sanitizeBody('employee_id').escape(),
    
    // Start processing requests
    async function (req, res, next) {
        
            
            const result = validationResult(req);
            var errors = result.errors;
              for (var key in errors) {
                    console.log(errors[key].value);
              }
            if (!result.isEmpty()) {
                console.log("This is the error message " + Object.values(errors));
                req.session.errors = errors;
                req.session.success = false;
                return res.redirect('/todo/boards');
            } else {
                req.session.success = false;
                models.Board.create({
                    board_name: req.body.board_name,
                    userId: req.body.employee_id
                }).then(function(board) {
                    req.session.sessionFlash = {
                        type: 'success',
                        comment: 'Great!',
                        message: 'Board Created Successfully.'
                    };
                    
                    console.log("Board created successfully");
                    // req.session.success = true;
                    return res.redirect('/todo/boards');
              });
            }
            // res.redirect('/todo/boards');
        
}
];


// Handle author delete on POST.
exports.board_delete_post = function(req, res, next) {
    models.Board.destroy({
        where: {
            id: req.params.board_id
        }
    }).then(function() { 
        res.redirect('/todo/boards');
        console.log('Board Deleted Successfully');
    });
};

// Handle board delete on GET.
exports.board_delete_get = function(req, res, next) {
    models.Board.destroy({
        where: {
            id: req.params.board_id
        }
    }).then(function(boards) { 
        req.session.sessionFlash = {
              type: 'success',
              comment: 'Great!',
              message: 'Board Deleted Successfully.'
            };
        console.log('Board Deleted Successfully');
        res.redirect('/todo/boards');
    });
};

exports.board_update_post = function(req, res, next) {
    console.log("ID is " + req.params.board_id);
    models.Board.update(
        // Values to update
        {
           board_name: req.body.board_name,
        }, { // Clause
            where: {
                id: req.params.board_id
            }
        }).then(board => {
        res.json({
            success: 'Board Updated Successfully',
            board: board
        });
    }).catch(error => {
        console.log("There was an error: " + error);
        res.status(404).send(error);
    })
};

// Display list of all authors.
exports.board_list = function(req, res, next) {
    console.log('I am in todo Dashboard');
    
        models.Board.findAll({
            // Add order conditions here....where clause, order, sort e.t.c
            order: [
                ['board_name', 'ASC'],
            ],
            include: [
                {
                  model: models.user,
                  attributes: ['id', 'firstname', 'lastname', 'username']
                },
            ]
        }).then(function(boards){
          res.render('pages/index', {
              title: 'Dashboard',
              page: 'boardPage',
              display: 'boardDisplay',
              user: req.user,
              sessionFlash: res.locals.sessionFlash,
              errors: req.session.errors,
              success: req.session.success,
              moment: moment,
              boards: boards,
              userContents: 'this is board content',
              layout: 'layouts/main'
              
          });
          console.log("Board Listed successfully");
          req.session.errors = null;
        });
};

// Display detail page for a specific author.
exports.board_detail = async function(req, res, next) {
    const board_id = req.params.board_id;
    
     const employees = await models.user.findAll({
        // where: {
        //   BoardId: req.params.board_id,
        // },
        order: [
            ['id', 'ASC'],
        ]
    });

    const tasks = await models.Task.findAll({
        where: {
          BoardId: req.params.board_id,
        },
        order: [
            ['title', 'ASC'],
        ],
        include: [
            {
              model: models.user,
              attributes: ['id', 'firstname', 'lastname', 'username']
            },
            {
              model: models.Team,
              attributes: ['id', 'team_name']
            },
        ]
    });
    
    const teams = await models.Team.findAll({
        where: {
          Employee_id: req.user.id,
        },
        order: [
            ['id', 'ASC'],
        ]
    });

    models.Board.findById(
            req.params.board_id, {
                include: [
                    {
                      model: models.user,
                      attributes: ['id', 'firstname', 'lastname', 'username']
                    },
                ]
            }    
        ).then(function(the_board) {
         if (the_board == null) { // No author with that id.
            var err = new Error('Board not found');
            err.status = 404;
            return next(err);
        }
        
        // Successful, so render.
        res.render('pages/index',  {
            title: 'Board Details',
            page: 'boardPage',
            display: 'boardDetail',
            employees: employees,
            board: the_board,
            board_id: board_id,
            tasks: tasks,
            teams: teams,
            user: req.user, // req.session.ret_data.data, //req.user,
            sessionFlash: res.locals.sessionFlash,
            errors: req.session.errors,
            success: req.session.success,
            moment: moment,
            layout: 'layouts/detail'
        });
        console.log("Board Details Listed Successfully");
        req.session.errors = null;
    });
};