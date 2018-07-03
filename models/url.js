module.exports = (sequelize, DataTypes) => {
  const Url = sequelize.define('Url', {
    short_name: DataTypes.STRING,
    full_url: DataTypes.STRING,
    file_location: DataTypes.STRING,
    file_name: DataTypes.STRING,
  }, {});
  Url.associate = () => {
    // associations can be defined here
  };
  return Url;
};
