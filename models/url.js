// Useful attributes
const urlAttributes = [
  'id',
  'short_name',
  'full_url',
  'file_location',
  'file_name',
];

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
  Url.findByShortName = shortName => (
    Url.findOne({
      attributes: urlAttributes,
      where: {
        short_name: shortName,
      },
    })
  );
  return Url;
};
