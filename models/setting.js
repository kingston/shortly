'use strict';
module.exports = (sequelize, DataTypes) => {
  var Setting = sequelize.define('Setting', {
    key: DataTypes.STRING,
    value: DataTypes.STRING
  }, {});
  Setting.associate = function(models) {
    // associations can be defined here
  };
  return Setting;
};