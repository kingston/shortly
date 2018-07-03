module.exports = (sequelize, DataTypes) => {
  const Setting = sequelize.define('Setting', {
    key: DataTypes.STRING,
    value: DataTypes.STRING,
  }, {});
  Setting.associate = () => {
    // associations can be defined here
  };
  return Setting;
};
