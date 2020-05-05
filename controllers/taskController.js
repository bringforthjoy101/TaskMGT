var models = require('../models');
var moment = require('moment');
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
    })
};

// Display list of all talkss.
exports.task_list = function(req, res, next) {
    models.Task.findAll({
        include: [
            {
              model: models.user,
              attributes: ['id', 'firstname', 'lastname', 'username']
            },
            {
                model: models.Board,
                attributes: ['id', 'board_name']
            },
        ]
    }).then(function(tasks){

        console.log("Board Listed successfully");

      res.render('pages/index', {
          title: 'Tasks',
          page: 'taskPage',
          display: 'taskDisplay',
          user: req.user,
          sessionFlash: res.locals.sessionFlash,
          errors: req.session.errors,
          success: req.session.success,
          moment: moment,
          tasks: tasks,
          layout: 'layouts/main'
      });
      req.session.errors = null;
    });
};

// Display list of all tasks belonging to an employee.
exports.task_list_employee = function(req, res, next) {
    models.Task.findAll({
        where: {Employee: req.user.username},
        include: [
            {
              model: models.user,
              attributes: ['id', 'firstname', 'lastname', 'username']
            },
            {
                model: models.Board,
                attributes: ['id', 'board_name']
            },
        ]
    }).then(function(tasks){

        console.log("Board Listed successfully");

      res.render('pages/index', {
          title: 'Tasks',
          page: 'taskPage',
          display: 'taskDisplay',
          user: req.user,
          moment: moment,
          tasks: tasks,
          layout: 'layouts/main'
          
      });
    });
};

// Display list of all active task.
exports.task_list_active = function(req, res, next) {
    models.Task.findAll({
        where: {Employee: req.user.username, status: 'InProgress' || 'Todo'},
        include: [
            {
              model: models.user,
              attributes: ['id', 'firstname', 'lastname', 'username']
            },
            {
                model: models.Board,
                attributes: ['id', 'board_name']
            },
        ]
    }).then(function(tasks){

        console.log("Board Listed successfully");

      res.render('pages/index', {
          title: 'Active Tasks',
          page: 'taskPage',
          display: 'taskDisplay',
          user: req.user,
          moment: moment,
          tasks: tasks,
          layout: 'layouts/main'
          
      });
    });
};

// Display list of all pending tasks.
exports.task_list_pending = function(req, res, next) {
    models.Task.findAll({
        where: {Employee: req.user.username, status: 'Todo'},
        include: [
            {
              model: models.user,
              attributes: ['id', 'firstname', 'lastname', 'username']
            },
            {
                model: models.Board,
                attributes: ['id', 'board_name']
            },
        ]
    }).then(function(tasks){

        console.log("Board Listed successfully");

      res.render('pages/index', {
          title: 'Pending Tasks',
          page: 'taskPage',
          display: 'taskDisplay',
          user: req.user,
          moment: moment,
          tasks: tasks,
          layout: 'layouts/main'
          
      });
      
    });
};

// Display list of all completed tasks.
exports.task_list_completed = function(req, res, next) {
    models.Task.findAll({
        where: {Employee: req.user.username, status: 'Done'},
        include: [
            {
              model: models.user,
              attributes: ['id', 'firstname', 'lastname']
            },
            {
                model: models.Board,
                attributes: ['id', 'board_name']
            },
        ]
    }).then(function(tasks){

        console.log("Board Listed successfully");

      res.render('pages/index', {
          title: 'Completed Tasks',
          page: 'taskPage',
          display: 'taskDisplay',
          user: req.user,
          moment: moment,
          tasks: tasks,
          layout: 'layouts/main'
          
      });
    });
};

// Display detail page for a specific task.
exports.task_detail = async function(req, res, next) {
    
    // const team = await models.Team.findById( req.params.team_id );
    // const board = await models.Team.findById( req.params.team_id );
    // const employee = await models.Team.findById( req.params.team_id );
    
    models.Task.findById(
        req.params.task_id, {
            include: [
                    {
                      model: models.user,
                      attributes: ['id', 'firstname', 'lastname', 'username']
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
            task: task,
            user: req.user,
            moment: moment,
            layout: 'layouts/detail'
        });
        console.log("task Details Listed Successfully");
        
    });
        
};

// Update task status to todo
exports.task_todo = function (req, res) {
  console.log("I want to update status to todo");
 
  let task_id = req.params.task_id;
  let employee_id = req.user.id;
  let team_id = req.params.team_id;
  let board_id = req.params.board_id;
  
  
  console.log("The task id is not null " + task_id);
  
  models.Task.update(
      // Values to update
          {
              status: 'Todo'
              
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
      //   returning: true, where: {id: req.params.expense_id} 
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
            //     comment: 'Great!',
            //     message: 'Expense Approved Successfully.'
            //   }
            res.redirect('/todo/team/' + team_id + '/board/' + board_id);
            console.log('Task Updated to todo');
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