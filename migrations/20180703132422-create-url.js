module.exports = {
  up: (queryInterface, Sequelize) => (
    queryInterface.createTable('Urls', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      short_name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      full_url: {
        type: Sequelize.STRING,
      },
      file_location: {
        type: Sequelize.STRING,
      },
      file_name: {
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
