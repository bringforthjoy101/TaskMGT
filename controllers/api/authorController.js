/**
 * Author controller for API endpoint.
 * Author: Babatope Olajide.
 * Version: 1.0.0
 * Release Date: 08-April-2020
 * Last Updated: 09-April-2020
 */

/**
 * Module dependencies.
 */
 
var async = require('async')
var models = require('../../modules/dbLayer');
var Book = models.book;
var Author = models.author;

const { body, validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');

/*
 * Module exports.
 */
 
/////////// AUTHOR CREATE //////////////

// Display Author create form on GET.
exports.author_create_get = function (req, res, next) {
    var displayData = {
                message: 'Get Function Executed Successfully',
                title: 'Create Author',
                page: 'authorPage',
                display: 'authorCreate',
                layout: 'layouts/detail' 
    };
    return res.status(200).json({success: displayData });

};

// Handle Author create on POST.
exports.author_create_post = [
 
    // Validate fields.
    body('firstname').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('lastname').isLength({ min: 1 }).trim().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Last name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601(),

    // Sanitize fields.
    sanitizeBody('firstname').escape(),
    sanitizeBody('lastname').escape(),
    sanitizeBody('bio').escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_death').toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);
        
        // Create Author object with escaped and trimmed data
        var author = new Author(
            {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                bio: req.body.bio,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death,
            }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            var errorResponse = {
                message: 'Validation error from form inputs',
                title: 'Create Author',
                author: author,
                errors: errors.array(),
                page: 'authorPage',
                display: 'authorCreate',
                layout: 'layouts/detail' 
                };
            return res.status(500).json({error: errorResponse });
           
        }
        else {
            // Data from form is valid.
        try {
            author.save({
                    author
                }).then(function(result) {
                    console.log("Author created successfully" + result);
                    // res.redirect('/catalog/authors');
                    var displayData = {
                        message: 'author created successfully',
                        results: result,
                    }
                    return res.status(200).json({success: displayData });
            });
        }     
        // catch error if the operation wasn't successful
        catch(err) {
            console.log('The error log ' + err);
            var catchResponse = {
                devMessage: 'Error creating Author',
                title: 'Author Create Post Function',
                fileLocation: 'controllers/authorController.js',
                error: err,
                message: err.message,
                layout: 'layouts/detail'
            };
            return res.status(500).json({ 
                error: catchResponse
            });
    }
        }
    }
];

///////////////// AUTHOR DISPLAY & LISTING ////////////////////////

// Display list of all Authors.
exports.author_list = function (req, res, next) {
    
    try {
            Author.findAll(
                {
                    // Add order conditions here....where clause, order, sort e.t.c
                    order: [
                        ['firstname', 'ASC'],
                    ]
                }
            ).then(function(list_authors) {
            var displayData = {
                authors: list_authors,
                title: 'Author List',
                page: 'authorPage',
                display: 'authorList',
                layout: 'layouts/detail' 
            };
            // Successful, so render.
            // res.render('pages/content', displayData);
            return res.status(200).json({success: displayData });
        });
    }
    // catch error if the operation wasn't successful
    catch(err) {
            console.log('The error log ' + err);
            // res.send(err); API
             console.log('The error log ' + err);
            var catchResponse = {
                devMessage: 'Error in Author Listing',
                title: 'Author List Function',
                fileLocation: 'controllers/authorController.js',
                error: err,
                message: err.message,
                layout: 'layouts/detail'
            };
            return res.status(500).json({ 
                error: catchResponse
            });
             
    }
};  
     
 
// Display detail page for a specific Author.
exports.author_detail = async function (req, res, next) {
    
    let author_id = req.params.author_id;
    
    var author_books = await Book.findAll({where: {authorId: author_id}});

    Author.findById(
                author_id, {
                include: [
                    {
                      model: Book
                    }
                         ]
                }
        ).then(function(the_author) {
         if (the_author == null) { // No author with that id.
            var err = new Error('Author not found');
            err.status = 404;
            // res.send(err); //API
            // return next(err);
             return res.status(404).json({ 
                error: err
            });
        }
        var displayData = {
                author: the_author,
                author_books: author_books,
                title: 'Author Details',
                page: 'authorPage',
                display: 'authorDetail',
                layout: 'layouts/detail' 
        };
    
        // Successful, so render.
        return res.status(200).json({success: displayData });
        // res.render('pages/content',  displayData );
    });

};

 
////////// FUNCTIONS NOT COMPLETED //////////////////

// Display Author delete form on GET.
exports.author_delete_get = function (req, res, next) {

    // delete get function

};

// Handle Author delete on POST.
exports.author_delete_post = function (req, res, next) {

     // delete post function

};

// Display Author update form on GET.
exports.author_update_get = function (req, res, next) {

    // let author_id = req.params.author_id;
    
    // Author.findById(author_id, function (author) {
    //     if (author == null) { // No results.
    //         var err = new Error('Author not found');
    //         err.status = 404;
    //         return next(err);
    //     }
    //     // Success.

    // });
};

// Handle Author update on POST.
exports.author_update_post = [

    // // Validate fields.
    // body('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
    //     .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    // body('family_name').isLength({ min: 1 }).trim().withMessage('Family name must be specified.')
    //     .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    // body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),
    // body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601(),

    // // Sanitize fields.
    // sanitizeBody('first_name').escape(),
    // sanitizeBody('family_name').escape(),
    // sanitizeBody('date_of_birth').toDate(),
    // sanitizeBody('date_of_death').toDate(),

    // // Process request after validation and sanitization.
    // (req, res, next) => {

    //     // Extract the validation errors from a request.
    //     const errors = validationResult(req);

    //     // Create Author object with escaped and trimmed data (and the old id!)
    //     var author = new Author(
    //         {
    //             first_name: req.body.first_name,
    //             family_name: req.body.family_name,
    //             date_of_birth: req.body.date_of_birth,
    //             date_of_death: req.body.date_of_death,
    //             _id: req.params.id
    //         }
    //     );

    //     if (!errors.isEmpty()) {
    //         // There are errors. Render the form again with sanitized values and error messages.
    //         res.render('author_form', { title: 'Update Author', author: author, errors: errors.array(), layout: 'layouts/detail' });
    //         return;
    //     }
    //     else {
    //         // Data from form is valid. Update the record.
    //         Author.findByIdAndUpdate(req.params.id, author, {}, function (err, theauthor) {
    //             if (err) { return next(err); }
    //             // Successful - redirect to genre detail page.
    //             res.redirect(theauthor.url);
    //         });
    //     }
    // }
];