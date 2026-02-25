'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('orders', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      table_id: {
        type: Sequelize.INTEGER,
        references: { model: 'tables', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      status: { type: Sequelize.ENUM('open', 'paid', 'cancelled'), defaultValue: 'open' },
      total: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      notes: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('orders');
  }
};
