'use strict';
module.exports = (sequelize, DataTypes) => {
  var Task = sequelize.define('Task', {
    title: {type: DataTypes.STRING, allowNull: false, validate: {len: [3, 50] } },
    desc: {type: DataTypes.TEXT, allowNull: false},
    duration: {type: DataTypes.INTEGER},
    Employee: {type: DataTypes.STRING, allowNull: true, validate: {len: [3, 50] } },
    status: {
      type: DataTypes.ENUM('Backlog', 'Todo', 'InProgress', 'Review', 'Done'),
      defaultValue: 'Backlog'
    },
    BoardId: {type: DataTypes.INTEGER},
    userId: {type: DataTypes.INTEGER},
    startedAt: {type: DataTypes.DATE, defaultValue: null},
    dueAt: {type: DataTypes.DATE, defaultValue: null},
    sprint: {type: DataTypes.INTEGER},
    sprintPeriod: {type: DataTypes.DATE, defaultValue: null},
    completedAt: {type: DataTypes.DATE, defaultValue: null},
  });

  Task.associate = function (models) {

    models.Task.belongsTo(models.user, {
      onDelete: "CASCADE",
      foreignKey: {
        allowNull: false
      }
    });
    
    models.Task.belongsTo(models.Team, {
      onDelete: "CASCADE",
      foreignKey: {
        allowNull: true,
      }
    });

    models.Task.belongsTo(models.Board, {
      onDelete: "CASCADE",
      foreignKey: {
        allowNull: false
      }
    });
  };

  return Task;
};
