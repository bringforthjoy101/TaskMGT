'use strict';
module.exports = (sequelize, DataTypes) => {
  var Board = sequelize.define('Board', {
    board_name: {type: DataTypes.STRING, validate: {len: [3, 50] } },
    userId: DataTypes.INTEGER
  });

  Board.associate = function(models) {
    models.Board.hasMany(models.Task);

    models.Board.belongsTo(models.user, {
      onDelete: "CASCADE",
      foreignKey: {
        allowNull: false
      }
    });
  };
  
  return Board;
};
 