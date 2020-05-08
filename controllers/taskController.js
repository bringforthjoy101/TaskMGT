var models = require('../models');
var moment = require('moment');
const { Op } = require('sequelize');
const { check, validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');

// Display task create form on GET.
exports.index = function(req, res, next) {
    res.json({
        success: 'Website is working fine'
    });
};


// Handle task create on POST.
exports.task_create_post = [
    
    // fields Validtion
    check('title')
    .not().isEmpty().withMessage('Title is required')
    .isLength({ min: 2 }).withMessage('Title must be at least 2 chars long')
    .custom(value => { return models.Task.findOne({ where: { title: value } })
    .then(task => { if (task) { return Promise.reject('Task Already Exists'); } }); }),
    check('desc').not().isEmpty().withMessage('Description is required'),
    check('duration').not().isEmpty().withMessage('Duration is required').isInt().withMessage('Duration must be an integer'),
    check('team_id').not().isEmpty().withMessage('Team is required').isInt().withMessage('Team ID must be an integer'),
    check('user_id').not().isEmpty().withMessage('User ID is required').isInt().withMessage('User ID must be an integer'),
    check('board_id').not().isEmpty().withMessage('Board ID is required').isInt().withMessage('Board ID must be an integer'),
    
    // Fields Sanitization
    sanitizeBody('title').escape(),
    sanitizeBody('desc').escape(),
    sanitizeBody('duration').escape(),
    sanitizeBody('team_id').escape(),
    sanitizeBody('user_id').escape(),
    sanitizeBody('board_id').escape(),
    
    async function(req, res, next) {
        let board_id = req.body.board_id;
        let user_id = req.body.user_id;
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
            res.redirect('/todo/board/' + board_id);
        } 
        
     // If the employee selected in the front end does not exist in DB return 400 error	
     if (!user_id) {
          return res.status(400);
     } else {

    models.Task.create({
        title: req.body.title,
        desc: req.body.desc,
        duration: req.body.duration,
        TeamId: req.body.team_id,
        userId: req.body.user_id,
        BoardId: req.body.board_id,
    }).then(function(task) {
        req.session.sessionFlash = {
                type: 'success',
                comment: 'Great!',
                message: 'Task Created Successfully.'
            };
        console.log("Task created successfully");
        res.redirect('/todo/team/' + team_id + '/board/' + board_id);
    });
     }
}
];

// Handle task delete on POST.
exports.task_delete_post = function(req, res, next) {
    models.Task.destroy({
        where: {
            id: req.params.task_id
        }
    }).then(function() { 
        res.redirect('/todo/tasks');
        console.log('Task Deleted Successfully');
    });
};

// Handle task delete on POST.
exports.task_delete_get = function(req, res, next) {
    models.Task.destroy({
        where: {
            id: req.params.task_id
        }
    }).then(function(tasks) { 
        req.session.sessionFlash = {
              type: 'success',
              comment: 'Great!',
              message: 'Role Deleted Successfully.'
            };
        console.log('Task Deleted Successfully');
        res.redirect('/todo/tasks');
    });
};

// Handles task update on POST
exports.task_update_post = function(req, res, next) {
    console.log("ID is " + req.params.task_id);
    models.Task.update(
        // Values to update
        {
            title: req.body.task_name,
            duration: req.body.duration,
            startedAt: req.body.startedAt,
            dueAt: req.body.dueAt,
            completedAt: req.body.completedAt,
            EmployeeId: req.body.employee_id,
            TeamId: req.body.team_id,
            StatusId: req.body.status_id,
            BoardId: req.body.board_id,
        }, { // Clause
            where: {
                id: req.params.task_id
            }
        }).then(task => {
        res.json({
            success: 'Task Updated Successfully',
            task: task
        });
    }).catch(error => {
        console.log("There was an error: " + error);
        res.status(404).send(error);
    });
};

// Display list of all talkss.
exports.all_task_list = async function(req, res, next) {
    const myPendingTasks = await models.Task.findAll({
        where: {Employee: req.user.username, status: 'Todo'},
        order: [
            ['id', 'DESC'],
        ],
        limit: 10,
        include: [
            {
              model: models.user,
              attributes: ['id', 'firstname', 'lastname', 'username', 'name']
            },
            {
                model: models.Board,
                attributes: ['id', 'board_name']
            },
        ]
    });
    
    const allPendingTasks = await models.Task.findAll({
        where: {status: 'Todo'},
        order: [
            ['id', 'DESC'],
        ],
        limit: 10,
        include: [
            {
              model: models.user,
              attributes: ['id', 'firstname', 'lastname', 'username', 'name']
            },
            {
                model: models.Board,
                attributes: ['id', 'board_name']
            },
        ]
    });
    
    const myActiveTasks = await models.Task.findAll({
        where: { 
            Employee: req.user.username,  
            status: 'InProgress',
        },
        order: [
            ['id', 'DESC'],
        ],
        limit: 10,
        include: [
            {
              model: models.user,
              attributes: ['id', 'firstname', 'lastname', 'username', 'name']
            },
            {
                model: models.Board,
                attributes: ['id', 'board_name']
            },
        ]
    });
    
    const allActiveTasks = await models.Task.findAll({
        where: {
           status: 'InProgress'
        },
        order: [
            ['id', 'DESC'],
        ],
        limit: 10,
        include: [
            {
              model: models.user,
              attributes: ['id', 'firstname', 'lastname', 'username', 'name']
            },
            {
                model: models.Board,
                attributes: ['id', 'board_name']
            },
        ]
    });
    
    const myCompletedTasks = await models.Task.findAll({
        where: {Employee: req.user.username, status: 'Done'},
        order: [
            ['id', 'DESC'],
        ],
        limit: 10,
        include: [
            {
              model: models.user,
              attributes: ['id', 'firstname', 'lastname', 'username', 'name']
            },
            {
                model: models.Board,
                attributes: ['id', 'board_name']
            },
        ]
    });
    
    const allCompletedTasks = await models.Task.findAll({
        where: {status: 'Done'},
        order: [
            ['id', 'DESC'],
        ],
        limit: 10,
        include: [
            {
              model: models.user,
              attributes: ['id', 'firstname', 'lastname', 'username', 'name']
            },
            {
                model: models.Board,
                attributes: ['id', 'board_name']
            },
        ]
    });
    
    const myCompletedTasksCount = await models.Task.findAndCountAll({
        where: {Employee: req.user.username, status: 'Done'}
    });
    
    const allCompletedTasksCount = await models.Task.findAndCountAll({
        where: {status: 'Done'}
    });
    
    const myActiveTasksCount = await models.Task.findAndCountAll({
        where: {Employee: req.user.username, status: 'InProgress'}
    });
    
    const allActiveTasksCount = await models.Task.findAndCountAll({
        where: {status: 'InProgress'}
    });
    
    const myPendingTasksCount = await models.Task.findAndCountAll({
        where: {Employee: req.user.username, status: 'Todo'}
    });
    
    const allPendingTasksCount = await models.Task.findAndCountAll({
        where: {status: 'Todo'}
    });
    
    const myTasksCount = await models.Task.findAndCountAll({
        where: {Employee: req.user.username}
    });
    
    const allTasksCount = await models.Task.findAndCountAll();
    
    const myTasks = models.Task.findAll({
        where: {Employee: req.user.username},
        order: [
            ['id', 'DESC'],
        ],
        limit: 10,
        include: [
            {
              model: models.user,
              attributes: ['id', 'firstname', 'lastname', 'username', 'name']
            },
            {
                model: models.Board,
                attributes: ['id', 'board_name']
            },
        ]
    });
    
    models.Task.findAll({
        order: [
            ['id', 'DESC'],
        ],
        limit: 10,
        include: [
            {
              model: models.user,
              attributes: ['id', 'firstname', 'lastname', 'username', 'name']
            },
            {
                model: models.Board,
                attributes: ['id', 'board_name']
            },
        ]
    }).then(function(allTasks){

        console.log("Tasks Listed successfully");

      res.render('pages/index', {
          title: 'My Tasks',
          page: 'taskPage',
          display: 'taskDisplay',
          user: req.user,
          moment: moment,
          myTasks: myTasks,
          allTasks: allTasks,
          myTasksCount: myTasksCount,
          allTasksCount: allTasksCount,
          myPendingTasksCount: myPendingTasksCount,
          allPendingTasksCount: allPendingTasksCount,
          myActiveTasksCount: myActiveTasksCount,
          allActiveTasksCount: allActiveTasksCount,
          myCompletedTasksCount: myCompletedTasksCount,
          allCompletedTasksCount: allCompletedTasksCount,
          myCompletedTasks: myCompletedTasks,
          allCompletedTasks: allCompletedTasks,
          myActiveTasks: myActiveTasks,
          allActiveTasks: allActiveTasks,
          myPendingTasks: myPendingTasks,
          allPendingTasks: allPendingTasks,
          parent: 'My Tasks',
          parentUrl: '/todo/alltasks',
          layout: 'layouts/main'
          
      });
    });
};

// Display list of all tasks belonging to an employee.
exports.my_task_list = async function(req, res, next) {
    
    const myPendingTasks = await models.Task.findAll({
        where: {Employee: req.user.username, status: 'Todo'},
        limit: 10,
        include: [
            {
              model: models.user,
              attributes: ['id', 'firstname', 'lastname', 'username', 'name']
            },
            {
                model: models.Board,
                attributes: ['id', 'board_name']
            },
        ]
    });
    
    const myActiveTasks = await models.Task.findAll({
        where: {Employee: req.user.username, status: 'InProgress'},
        limit: 10,
        include: [
            {
              model: models.user,
              attributes: ['id', 'firstname', 'lastname', 'username', 'name']
            },
            {
                model: models.Board,
                attributes: ['id', 'board_name']
            },
        ]
    });
    
    const myCompletedTasks = await models.Task.findAll({
        where: {Employee: req.user.username, status: 'Done'},
        limit: 10,
        include: [
            {
              model: models.user,
              attributes: ['id', 'firstname', 'lastname', 'username', 'name']
            },
            {
                model: models.Board,
                attributes: ['id', 'board_name']
            },
        ]
    });
    
    const myCompletedTasksCount = await models.Task.findAndCountAll({
        where: {Employee: req.user.username, status: 'Done'}
    });
    
    const myActiveTasksCount = await models.Task.findAndCountAll({
        where: {Employee: req.user.username, status: 'InProgress'}
    });
    
    const myPendingTasksCount = await models.Task.findAndCountAll({
        where: {Employee: req.user.username, status: 'Todo'}
    });
    
    const myTasksCount = await models.Task.findAndCountAll({
        where: {Employee: req.user.username}
    });
    
    models.Task.findAll({
        where: {Employee: req.user.username},
        limit: 10,
        include: [
            {
              model: models.user,
              attributes: ['id', 'firstname', 'lastname', 'username', 'name']
            },
            {
                model: models.Board,
                attributes: ['id', 'board_name']
            },
        ]
    }).then(function(tasks){

        console.log("Board Listed successfully");

      res.render('pages/index', {
          parent: 'My Tasks',
          parentUrl: '/todo/mytasks',
          title: 'Tasks',
          page: 'taskPage',
          display: 'taskDisplay',
          user: req.user,
          moment: moment,
          tasks: tasks,
          myTasksCount: myTasksCount,
          myPendingTasksCount: myPendingTasksCount,
          myActiveTasksCount: myActiveTasksCount,
          myCompletedTasksCount: myCompletedTasksCount,
          myCompletedTasks: myCompletedTasks,
          myActiveTasks: myActiveTasks,
          myPendingTasks: myPendingTasks,
          layout: 'layouts/main'
          
      });
    });
};


// Display detail page for a specific task.
exports.task_detail = async function(req, res, next) {
    
    let task_id = req.params.task_id;
  let employee_id = req.user.id;
  let team_id = req.params.team_id;
  let board_id = req.params.board_id;
    
    // const team = await models.Team.findById( req.params.team_id );
    // const board = await models.Team.findById( req.params.team_id );
    const board = await models.Board.findById( req.params.board_id );
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
    
    models.Task.findById(
        req.params.task_id, {
            include: [
                    {
                      model: models.user,
                      attributes: ['id', 'firstname', 'lastname', 'username', 'name']
                    },
                    {
                      model: models.Board,
                      attributes: ['id', 'board_name']
                    },
                    {
                      model: models.Team,
                      attributes: ['id', 'team_name']
                    }
                    
                ]
        } 
        ).then(function(task) {
         if (task == null) { // No author with that id.
            var err = new Error('Board not found');
            err.status = 404;
            return next(err);
        }
        
        // Successful, so render.
        res.render('pages/index',  {
            title: 'Task Details',
            page: 'taskPage',
            display: 'taskDetail',
            parent: 'My Tasks',
            parentUrl: '/todo/team/' + team_id + '/board/' + board_id,
            teamUsers: teamUsers,
            task: task,
            board: board,
            user: req.user,
            moment: moment,
            layout: 'layouts/detail'
        });
        console.log("task Details Listed Successfully");
        
    });
        
};

// Assign task 
exports.task_assign = function (req, res) {
  console.log("I want to update status to todo");
 
  let task_id = req.params.task_id;
  let employee_id = req.user.id;
  let team_id = req.body.team_id;
  let board_id = req.body.board_id;
  
  
  console.log("The task id is not null " + task_id);
  
  models.Task.update(
      // Values to update
          {
              status: 'Todo',
              Employee: req.body.teamUser
              
          },
        { // Clause
              where: 
              {
                  id: task_id
              }
          }
      //   returning: true, where: {id: req.params.task_id} 
       ).then(function(){
           models.Task.update(
      // Values to update
          {
              startedAt: Date.now(),
              
          },
        { // Clause
              where: 
              {
                  id: req.body.task_id
              }
          }
      //   returning: true, where: {id: req.params.expense_id} 
       ).then(function(){
           const date = models.Task.findById(req.body.task_id);
            var sprint_date = moment(date.startedAt).add(14, 'days').format();
           models.Task.update(
      // Values to update
          {
              sprintPeriod: sprint_date,
              
          },
        { // Clause
              where: 
              {
                  id: req.body.task_id
              }
          }
      //   returning: true, where: {id: req.params.expense_id} 
       ).then(function(){
            const date = models.Task.findById(req.body.task_id);
            var status = moment(date.startedAt).add(16, 'hours').format();
            
            models.Task.update(
          // Values to update
              {
                  dueAt: status
                  
              },
            { // Clause
                  where: 
                  {
                      id: req.body.task_id
                  }
              }
          //   returning: true, where: {id: req.params.expense_id} 
           ).then(function(){
        //check if employee id is present in the route
        if(employee_id){
            // req.session.sessionFlash = {
            //     type: 'success',
            //     comment: 'Great!',
            //     message: 'Expense Approved Successfully.'
            //   }
            if(board_id !== undefined) {
            res.redirect('/todo/task/' + team_id + '/' + board_id + '/' + task_id);
            } else {
                res.redirect('/todo/team/' + team_id + '/board/' + board_id);
            }
            console.log('Task Updated to todo');
        } else {
            // req.session.sessionFlash = {
            //     type: 'error',
            //     message: 'Oops, Something went wrong.'
            //   }
            res.redirect('/todo/task/' + team_id + '/' + board_id + '/' + task_id);
            console.log('Task Not Updated ');
        }
    });
       });
       });
       });
};

// Unassign task 
exports.task_unassign = function (req, res) {
  console.log("I want to update status to todo");
 
  let task_id = req.params.task_id;
  let employee_id = req.user.id;
  let team_id = req.params.team_id;
  let board_id = req.params.board_id;
  
  
  console.log("The task id is not null " + task_id);
  
  models.Task.update(
      // Values to update
          {
              status: 'Backlog',
              Employee: null,
              startedAt: null,
              sprintPeriod: null,
              dueAt: null,
              
          },
        { // Clause
              where: 
              {
                  id: task_id
              }
          }
      //   returning: true, where: {id: req.params.task_id} 
       ).then(function(){
           
        //check if employee id is present in the route
        if(employee_id){
            req.session.sessionFlash = {
                type: 'success',
                comment: 'Great!',
                message: 'Task Unassigned Successfully.'
              }
            if(board_id !== undefined) {
            res.redirect('/todo/task/' + team_id + '/' + board_id + '/' + task_id);
            } else {
                res.redirect('/todo/team/' + team_id + '/board/' + board_id);
            }
            console.log('Task Updated to todo');
        } else {
            req.session.sessionFlash = {
                type: 'error',
                message: 'Oops, Something went wrong.'
              }
            res.redirect('/todo/task/' + team_id + '/' + board_id + '/' + task_id);
            console.log('Task Not Updated ');
        }
    });
};

// Update task status to InProgess
exports.task_inprogress = function (req, res) {
  console.log("I want to update status to inprogress");
 
  let task_id = req.params.task_id;
  let employee_id = req.user.id;
  let team_id = req.params.team_id;
  let board_id = req.params.board_id;
  
  
  console.log("The task id is not null " + task_id);
  
  models.Task.update(
      // Values to update
          {
              status: 'InProgress'
              
          },
        { // Clause
              where: 
              {
                  id: req.params.task_id
              }
          }
      //   returning: true, where: {id: req.params.expense_id} 
       ).then(function(){
           
        //check if employee id is present in the route
        if(employee_id){
            // req.session.sessionFlash = {
            //     type: 'success',
            //     message: 'Expense Approved Successfully.'
            //   }
            res.redirect('/todo/team/' + team_id + '/board/' + board_id);
            console.log('Task Updated ');
        } else {
            // req.session.sessionFlash = {
            //     type: 'error',
            //     message: 'Oops, Something went wrong.'
            //   }
            res.redirect('/todo/team/' + team_id + '/board/' + board_id);
            console.log('Task Not Updated ');
        }
    });
};

// Update task status to Review
exports.task_review = function (req, res) {
  console.log("I want to update status to review");
 
  let task_id = req.params.task_id;
  let employee_id = req.user.id;
  let team_id = req.params.team_id;
  let board_id = req.params.board_id;
  
  
  console.log("The task id is not null " + task_id);
  
  models.Task.update(
      // Values to update
          {
              status: 'Review'
              
          },
        { // Clause
              where: 
              {
                  id: req.params.task_id
              }
          }
      //   returning: true, where: {id: req.params.expense_id} 
       ).then(function(){
           
        //check if employee id is present in the route
        if(employee_id){
            // req.session.sessionFlash = {
            //     type: 'success',
            //     message: 'Expense Approved Successfully.'
            //   }
            res.redirect('/todo/team/' + team_id + '/board/' + board_id);
            console.log('Task Updated to review ');
        } else {
            // req.session.sessionFlash = {
            //     type: 'error',
            //     message: 'Oops, Something went wrong.'
            //   }
            res.redirect('/todo/team/' + team_id + '/board/' + board_id);
            console.log('Task Not Updated ');
        }
    });
};

// Update task status to Review
exports.task_done = async function (req, res) {
  console.log("I want to update status to done");
 
  let task_id = req.params.task_id;
  let employee_id = req.user.id;
  let team_id = req.params.team_id;
  let board_id = req.params.board_id;
  
  console.log("The task id is not null " + task_id);
  
  models.Task.update(
      // Values to update
          {
              status: 'Done'
              
          },
        { // Clause
              where: 
              {
                  id: req.params.task_id
              }
          }
      //   returning: true, where: {id: req.params.task_id} 
       ).then(function(){
           models.Task.update(
              // Values to update
                  {
                      completedAt: Date.now()
                      
                  },
                { // Clause
                      where: 
                      {
                          id: req.params.task_id
                      }
                  }
              //   returning: true, where: {id: req.params.expense_id} 
               ).then(function(){
                   const thisTask = models.Task.findById(task_id);
                   var date1 = new Date(moment(thisTask.sprint).format('L'));
                   var date2 = new Date(moment(thisTask.completedAt).format('L'));
                   var diff = parseInt((date1 - date2) / (1000 * 3600 * 24));
                   console.log('this is the date difference ' + diff);
                //   var sprint_period = diff / (1000 * 3600 * 24);
                   
            models.Task.update(
              // Values to update
                  {
                      sprint: diff
                      
                  },
                { // Clause
                      where: 
                      {
                          id: req.params.task_id
                      }
                  }
              //   returning: true, where: {id: req.params.expense_id} 
               ).then(function(){           
        //check if employee id is present in the route
        if(employee_id){
            // req.session.sessionFlash = {
            //     type: 'success',
            //     message: 'Expense Approved Successfully.'
            //   }
            res.redirect('/todo/team/' + team_id + '/board/' + board_id);
            console.log('Task Updated to Done ');
        } else {
            // req.session.sessionFlash = {
            //     type: 'error',
            //     message: 'Oops, Something went wrong.'
            //   }
            res.redirect('/todo/team/' + team_id + '/board/' + board_id);
            console.log('Task Not Updated ');
        }
    });
       });
       });
};

// Pick up a task
exports.task_pick = function (req, res) {
  console.log("I want to update status to todo");
 
  let task_id = req.params.task_id;
  let employee_id = req.user.id;
  let team_id = req.params.team_id;
  let board_id = req.params.board_id;
  
  
  console.log("The task id is not null " + task_id);
  
  models.Task.update(
      // Values to update
          {
              status: 'Todo',
              Employee: req.user.username
              
          },
        { // Clause
              where: 
              {
                  id: req.params.task_id
              }
          }
      //   returning: true, where: {id: req.params.task_id} 
       ).then(function(){
           models.Task.update(
      // Values to update
          {
              startedAt: Date.now(),
              
          },
        { // Clause
              where: 
              {
                  id: req.params.task_id
              }
          }
      //   returning: true, where: {id: req.params.task_id} 
       ).then(function(){
           const date = models.Task.findById(req.params.task_id);
            var sprint_date = moment(date.startedAt).add(14, 'days').format();
           models.Task.update(
      // Values to update
          {
              sprintPeriod: sprint_date,
              
          },
        { // Clause
              where: 
              {
                  id: req.params.task_id
              }
          }
      //   returning: true, where: {id: req.params.expense_id} 
       ).then(function(){
            const date = models.Task.findById(req.params.task_id);
            var status = moment(date.startedAt).add(16, 'hours').format();
            
            models.Task.update(
          // Values to update
              {
                  dueAt: status
                  
              },
            { // Clause
                  where: 
                  {
                      id: req.params.task_id
                  }
              }
          //   returning: true, where: {id: req.params.expense_id} 
           ).then(function(){
        //check if employee id is present in the route
        if(employee_id){
            // req.session.sessionFlash = {
            //     type: 'success',
            //     message: 'Expense Approved Successfully.'
            //   }
            res.redirect('/todo/team/' + team_id + '/board/' + board_id);
            // res.redirect("/todo/team/" + team_id);
            console.log('Task Updated to todo');
        } else {
            // req.session.sessionFlash = {
            //     type: 'error',
            //     message: 'Oops, Something went wrong.'
            //   }
            res.redirect('/todo/team/' + team_id + '/board/' + board_id);
            // res.redirect("/todo/team/" + team_id);
            console.log('Task Not Updated ');
        }
    });
       });
       });
       });
};