/**
 * Database user model.
 * Author: Babatope Olajide.
 * Version: 1.0.0
 * Release Date: 08-April-2020
 * Last Updated: 09-April-2020
 */

/**
 * Module dependencies.
 */
 
// put your model dependencies here...
// i.e. var moment = require('moment'); // For date handling e.t.c
// var dbLayer = require('../modules/dbLayer');

/**
 * Model Development
 */
 
module.exports = function(sequelize, Sequelize) {

    var User = sequelize.define('user', {

        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        firstname: {
            type: Sequelize.STRING,
            allowNull: true
        },

        lastname: {
            type: Sequelize.STRING,
            allowNull: true
        },

        username: {
            type: Sequelize.TEXT,
            allowNull: false,
            validate: {
              len: [8, 50] // must be between 8 and 50.
            }
        },
        
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },

        password: {
            type: Sequelize.STRING,
            allowNull: false
        },

        last_login: {
            type: Sequelize.DATE
        },

        status: {
            type: Sequelize.ENUM('active', 'inactive'),
            defaultValue: 'active'
        },
        
        // you can also write in a single line without issues
        name:{type: Sequelize.STRING, unique: false},
        module_name: {type: Sequelize.STRING},
        module_id : {type: Sequelize.INTEGER},
        account_id : {type: Sequelize.STRING},
        permission : {type: Sequelize.STRING},
        profile : {type: Sequelize.STRING},
        department_name : {type: Sequelize.STRING},
        current_business : {type: Sequelize.STRING}

    });

    User.associate = function(models) {
        models.user.hasMany(models.Task);
        models.user.hasMany(models.Board);
    
        models.user.belongsToMany(models.Team, { 
            as: 'teams',
            through: 'TeamUsers',
            foreignKey: 'user_id'
        });
    };

    return User;

}

 
    