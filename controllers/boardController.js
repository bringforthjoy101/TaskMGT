var models = require('../models');
var moment = require('moment');
const { check, validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');

// Display author create form on GET.
exports.index = async function(req, res, next) {
    console.log('I am in todo Dashboard');
    
    const allHoursCompleted = await models.Task.sum('duration', {
        where: {status: 'Done'}
    });
    
    const myHoursCompleted = await models.Task.sum('duration', {
        where: {Employee: req.user.username, status: 'Done'}
    });
    
    const allHoursLeft = await models.Task.sum('duration', {
        where: {completedAt: null}
    });
    
    const myHoursLeft = await models.Task.sum('duration', {
        where: {Employee: req.user.username, completedAt: null}
    });
    
    // const myBoardCount = await models.Board.findAndCountAll({
    //     where: {Employee: req.user.username}
    // });
    
    const myTeams = await models.user.findById(
                req.user.id,
                {
                    include: [
                     {
                          model: models.Team,
                          as: 'teams',
                          required: false,
                          // Pass in the Team attributes that you want to retrieve
                          attributes: ['id', 'team_name', 'createdAt'],
                          through: {
                            // This block of code allows you to retrieve the properties of the join table TeamUsers
                            model: models.TeamUsers,
                            as: 'teamUsers',
                            attributes: ['team_id', 'user_id'],
                        }
                    }
                ]
              }
        );
    
    const myTaskCount = await models.Task.findAndCountAll({
        where: {Employee: req.user.username}
    });
    
    models.Board.findAndCountAll(
        ).then(function(boardCount)
        {
          models.Team.findAndCountAll(
        ).then(function(teamCount)
        {
          models.Task.findAndCountAll(
        ).then(function(taskCount)
        {
          models.user.findAndCountAll(
        ).then(function(userCount)
        {
   
            res.render('pages/index', {
                title: 'Homepage', 
                page: 'dashboardPage1',
                display: 'dashboardDisplay1',
                boardCount: boardCount, 
                // myBoardCount: myBoardCount,
                teamCount: teamCount,
                myTeams: myTeams,
                user: req.user,
                taskCount: taskCount,
                myTaskCount: myTaskCount,
                userCount: userCount,
                allHoursCompleted: allHoursCompleted,
                myHoursCompleted: myHoursCompleted,
                allHoursLeft: allHoursLeft,
                myHoursLeft: myHoursLeft,
                layout: 'layouts/main',
                parent: 'Todo Dashboard',
                parentUrl: '/',
            });
          
          // res.render('pages/index_list_sample', { title: 'Post Details', layout: 'layouts/list'});
          // res.render('pages/index_detail_sample', { page: 'Home' , title: 'Post Details', layout: 'layouts/detail'});
        });
        });
        });
        });
};

exports.board_create_get = 
    function (req, res, next) {
    var displayData = {
                title: 'Create Board',
                page: 'boardPage',
                display: 'boardCreate',
                layout: 'layouts/detail',
                parent: ' Todo Dashboard',
                parentUrl: '/'
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
    check('employee_id').not().isEmpty().withMessage('Employee is required'),
    check('team_id').not().isEmpty().withMessage('Team is required'),
    
    // Fields Sanitization
    sanitizeBody('board_name').escape(),
    sanitizeBody('employee_id').escape(),
    
    // Start processing requests
    async function (req, res, next) {
        let team_id = req.body.team_id;
            
            const result = validationResult(req);
            var errors = result.errors;
              for (var key in errors) {
                    console.log(errors[key].value);
              }
            if (!result.isEmpty()) {
                console.log("This is the error message " + Object.values(errors));
                req.session.errors = errors;
                req.session.success = false;
                return res.redirect('/todo/team/' + team_id);
            } else {
                req.session.success = false;
                const board = await models.Board.create({
                    board_name: req.body.board_name,
                    userId: req.body.employee_id
                });
                
                const team = await models.Team.findById(req.body.team_id);
                if (!team) {
                return res.status(400);
                }
                //otherwise add new entry inside TeamUsers table
                await board.addTeam(team);
                
                    req.session.sessionFlash = {
                        type: 'success',
                        comment: 'Great!',
                        message: 'Board Created Successfully.'
                    };
                    
                    console.log("Board created successfully");
                    // req.session.success = true;
                    return res.redirect('/todo/team/' + team_id);
             
            }
            // res.redirect('/todo/boards');
        
}
];


// Handle author delete on POST.
exports.board_delete_post = function(req, res, next) {
    let team_id = req.params.team_id;
    models.Board.destroy({
        where: {
            id: req.params.board_id
        }
    }).then(function() { 
        res.redirect('/todo/team/' + team_id);
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
    let team_id = req.body.team_id;
    console.log("ID is " + req.params.board_id);
    models.Board.update(
        // Values to update
        {
           board_name: req.body.board_name,
        }, { // Clause
            where: {
                id: req.params.board_id
            }
        }).then(function() {
        return res.redirect('/todo/team/' + team_id);
    }).catch(error => {
        console.log("There was an error: " + error);
        res.status(404).send(error);
    });
};

// Display list of all authors.
exports.board_list = function(req, res, next) {
    console.log('I am in todo Dashboard');
    
        models.Board.findAll({
            // Add order conditions here....where clause, order, sort e.t.c
            order: [
                ['id', 'ASC'],
            ],
            include: [
                {
                  model: models.user,
                  attributes: ['id', 'firstname', 'lastname', 'username', 'name']
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
            ['id', 'DESC'],
        ]
    });
    
    const teamUsers = await models.Team.findById(
            req.params.team_id,
            {
                include: [
                 {
                      model: models.user,
                      as: 'users',
                      required: false,
                      // Pass in the Team attributes that you want to retrieve
                      attributes: ['id', 'username', 'name', 'profile'],
                      through: {
                        // This block of code allows you to retrieve the properties of the join table TeamUsers
                        model: models.TeamUsers,
                        as: 'teamUsers',
                        attributes: ['team_id', 'user_id'],
                    }
                }
            ]
          }
    );

    const tasks = await models.Task.findAll({
        where: { BoardId: req.params.board_id },
        order: [
            ['id', 'DESC'],
        ],
        include: [
            {
              model: models.user,
              attributes: ['id', 'firstname', 'lastname', 'username', 'name']
            },
            {
              model: models.Team,
              attributes: ['id', 'team_name']
            },
        ]
    });
    
    const tasksBacklog = await models.Task.findAll({
        where: { BoardId: req.params.board_id, status: 'Backlog' },
        order: [
            ['id', 'DESC'],
        ],
        include: [
            {
              model: models.user,
              attributes: ['id', 'firstname', 'lastname', 'username', 'name']
            },
            {
              model: models.Team,
              attributes: ['id', 'team_name']
            },
        ]
    });
    
    const tasksTodoManager = await models.Task.findAll({
        where: { BoardId: req.params.board_id, status: 'Todo' },
        order: [
            ['id', 'DESC'],
        ],
        include: [
            {
              model: models.user,
              attributes: ['id', 'firstname', 'lastname', 'username', 'name']
            },
            {
              model: models.Team,
              attributes: ['id', 'team_name']
            },
        ]
    });
    
    const tasksInProgressManager = await models.Task.findAll({
        where: { BoardId: req.params.board_id, status: 'InProgress' },
        order: [
            ['id', 'DESC'],
        ],
        include: [
            {
              model: models.user,
              attributes: ['id', 'firstname', 'lastname', 'username', 'name']
            },
            {
              model: models.Team,
              attributes: ['id', 'team_name']
            },
        ]
    });
    
    const tasksReviewManager = await models.Task.findAll({
        where: { BoardId: req.params.board_id, status: 'Review' },
        order: [
            ['id', 'DESC'],
        ],
        include: [
            {
              model: models.user,
              attributes: ['id', 'firstname', 'lastname', 'username', 'name']
            },
            {
              model: models.Team,
              attributes: ['id', 'team_name']
            },
        ]
    });
    
    const tasksDoneManager = await models.Task.findAll({
        where: { BoardId: req.params.board_id, status: 'Done' },
        order: [
            ['id', 'DESC'],
        ],
        include: [
            {
              model: models.user,
              attributes: ['id', 'firstname', 'lastname', 'username', 'name']
            },
            {
              model: models.Team,
              attributes: ['id', 'team_name']
            },
        ]
    });
    
    const tasksTodo = await models.Task.findAll({
        where: { BoardId: req.params.board_id, status: 'Todo', Employee: req.user.username },
        order: [
            ['id', 'DESC'],
        ],
        include: [
            {
              model: models.user,
              attributes: ['id', 'firstname', 'lastname', 'username', 'name']
            },
            {
              model: models.Team,
              attributes: ['id', 'team_name']
            },
        ]
    });
    
    const tasksInProgress = await models.Task.findAll({
        where: { BoardId: req.params.board_id, status: 'InProgress', Employee: req.user.username },
        order: [
            ['id', 'DESC'],
        ],
        include: [
            {
              model: models.user,
              attributes: ['id', 'firstname', 'lastname', 'username', 'name']
            },
            {
              model: models.Team,
              attributes: ['id', 'team_name']
            },
        ]
    });
    
    const tasksReview = await models.Task.findAll({
        where: { BoardId: req.params.board_id, status: 'Review', Employee: req.user.username },
        order: [
            ['id', 'DESC'],
        ],
        include: [
            {
              model: models.user,
              attributes: ['id', 'firstname', 'lastname', 'username', 'name']
            },
            {
              model: models.Team,
              attributes: ['id', 'team_name']
            },
        ]
    });
    
    const tasksDone = await models.Task.findAll({
        where: { BoardId: req.params.board_id, status: 'Done', Employee: req.user.username },
        order: [
            ['id', 'DESC'],
        ],
        include: [
            {
              model: models.user,
              attributes: ['id', 'firstname', 'lastname', 'username', 'name']
            },
            {
              model: models.Team,
              attributes: ['id', 'team_name']
            },
        ]
    });
    
    const team = await models.Team.findById(req.params.team_id);
    const boardName = await models.Board.findById(req.params.board_id);
    let team_id = req.params.team_id;
    models.Board.findById(
            req.params.board_id, {
                include: [
                    {
                      model: models.user,
                      attributes: ['id', 'firstname', 'lastname', 'username', 'name']
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
            title: 'Board Tasks',
            page: 'boardPage',
            display: 'boardDetail',
            parent: 'Boards',
            parentUrl: '/todo/team/' + team_id,
            employees: employees,
            board: the_board,
            board_id: board_id,
            teamUsers: teamUsers,
            tasks: tasks,
            boardName: boardName,
            tasksBacklog: tasksBacklog,
            tasksTodo: tasksTodo,
            tasksInProgress: tasksInProgress,
            tasksReview: tasksReview,
            tasksDone: tasksDone,
            tasksTodoManager: tasksTodoManager,
            tasksInProgressManager: tasksInProgressManager,
            tasksReviewManager: tasksReviewManager,
            tasksDoneManager: tasksDoneManager,
            team: team,
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