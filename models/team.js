'use strict';
module.exports = (sequelize, DataTypes) => {
  var Team = sequelize.define('Team', {
    team_name: {type: DataTypes.STRING, allowNull: false, validate: {len: [3, 50] } },
    Employee_id: {type: DataTypes.INTEGER}
  });

  Team.associate = function(models) {
    models.Team.hasMany(models.Task);

    models.Team.belongsToMany(models.user, 
      { 
          as: 'users',
          through: 'TeamUsers',
          foreignKey: 'team_id'
      });
  };

  return Team;
};
 