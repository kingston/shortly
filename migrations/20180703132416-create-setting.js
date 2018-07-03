module.exports = {
  up: (queryInterface, Sequelize) => (
    queryInterface.createTable('Settings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      key: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      value: {
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
    queryInterface.dropTable('Settings')
  ),
};
