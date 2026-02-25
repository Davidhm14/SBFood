'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cash_registers', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      opened_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      closed_at: { type: Sequelize.DATE },
      initial_amount: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      final_amount: { type: Sequelize.DECIMAL(10, 2) },
      status: { type: Sequelize.ENUM('open', 'closed'), defaultValue: 'open' },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('cash_registers');
  }
};
