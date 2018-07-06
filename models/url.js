// Useful attributes
const urlAttributes = [
  'id',
  'shortName',
  'fullUrl',
  'fileLocation',
  'fileName',
];

module.exports = (sequelize, DataTypes) => {
  const Url = sequelize.define('Url', {
    shortName: DataTypes.STRING,
    fullUrl: DataTypes.STRING,
    fileLocation: DataTypes.STRING,
    fileName: DataTypes.STRING,
  }, {});
  Url.associate = () => {
    // associations can be defined here
  };
  Url.findByShortName = shortName => (
    Url.findOne({
      attributes: urlAttributes,
      where: {
        shortName,
      },
    })
  );
  return Url;
};
