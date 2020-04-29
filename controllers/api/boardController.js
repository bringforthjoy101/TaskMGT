var models = require('../../models');
const { check, validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');

// Display Todo dashboard
exports.index = function(req, res, next) {
    
    console.log('I am in todo Dashboard');
    // find the count of models in database
    
    models.Board.findAndCountAll(
        ).then(function(boardCount)
        {
          models.Team.findAndCountAll(
        ).then(function(teamCount)
        {
          models.user.findAndCountAll(
        ).then(function(userCount)
        {
        
        var displayData = {
            message: 'Dashboard Overview',
            title: 'Dashboard Overview',
            boardCount: boardCount.count, 
            teamCount: teamCount.count,
            userCount: userCount.count,
        };
        return res.status(200).json({success: displayData });
        
        });
        });
        });
};

exports.board_create_get = function (req, res, next) {
    var displayData = {
                title: 'Create Board',
                page: 'boardPage',
                display: 'boardCreate',
                layout: 'layouts/detail' 
    };
    return res.status(200).json({success: displayData });
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
    function (req, res, next) {
        const errors = validationResult(req);
        if (errors) {
            var errorResponse = {
                message: 'Validation error from form inputs',
                title: 'Create Board',
                errors: errors.array(), 
                };
            return res.status(500).json({error: errorResponse });
        }
    models.Board.create({
        board_name: req.body.board_name,
        userId: req.body.employee_id
    }).then(function(board) {
            console.log("Board created successfully");
           // check if there was an error during post creation
            var displayData = {
                message: 'Board created successfully',
                board: board,
            };
            return res.status(200).json({success: displayData });
        });
}
];

// Handle board delete on POST.
exports.board_delete_post = function(req, res, next) {
    models.Board.destroy({
        where: {
            id: req.params.board_id
        }
    }).then(() => res.json({
        success: 'Board Deleted Successfully'
    })).catch(error => {
        res.status(404).send(error);
    });
};

exports.board_update_post = function(req, res, next) {
    console.log("ID is " + req.params.board_id);
    models.Board.update(
        {
           board_name: req.body.board_name,
        }, {
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
    });
};

// Display list of all boards.
exports.board_list = function(req, res, next) {
    console.log('I am in todo Dashboard');
    try{
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
                console.log("Board Listed successfully");
              var displayData =  {
                  title: 'Dashboard',
                  page: 'boardPage',
                  display: 'boardDisplay',
                  boards: boards,
              };
              return res.status(200).json({success: displayData });
            });
        }
    // catch error if the operation wasn't successful
    catch(err) {
             console.log('The error log ' + err);
            var catchResponse = {
                devMessage: 'Error in Board Listing',
                title: 'board List Function',
                fileLocation: 'controllers/api/boardController.js',
                error: err,
                message: err.message,
            };
            return res.status(500).json({ 
                error: catchResponse
            });
             
    }
};

// Display detail page for a board.
exports.board_detail = async function(req, res, next) {
    const board_id = req.params.board_id;
    
    const employees = await models.user.findAll({
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
            return res.status(404).json({ 
                error: err
            });
        }
        var displayData = {
            title: 'Board Details',
            page: 'boardPage',
            display: 'boardDetail',
            employees: employees,
            board: the_board,
            board_id: board_id,
            tasks: tasks,
        };
        console.log("Board Details Listed Successfully");
        // Successful, so render.
        return res.status(200).json({success: displayData });
        
    });
};