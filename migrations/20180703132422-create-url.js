module.exports = {
  up: (queryInterface, Sequelize) => (
    queryInterface.createTable('Urls', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      shortName: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      fullUrl: {
        type: Sequelize.STRING,
      },
      fileLocation: {
        type: Sequelize.STRING,
      },
      fileName: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
  ),
  down: (queryInterface, Sequelize) => (
    queryInterface.dropTable('Urls')
  ),
};
