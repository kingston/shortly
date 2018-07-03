'use strict';
module.exports = (sequelize, DataTypes) => {
  var Url = sequelize.define('Url', {
    short_name: DataTypes.STRING,
    full_url: DataTypes.STRING,
    file_location: DataTypes.STRING,
    file_name: DataTypes.STRING
  }, {});
  Url.associate = function(models) {
    // associations can be defined here
  };
  return Url;
};