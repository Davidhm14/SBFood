'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('users', [
      {
        name: 'Administrador',
        email: 'admin@sbfood.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Cajero Principal',
        email: 'cajero@sbfood.com',
        password: await bcrypt.hash('cajero123', 10),
        role: 'cashier',
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Mesero 1',
        email: 'mesero@sbfood.com',
        password: await bcrypt.hash('mesero123', 10),
        role: 'waiter',
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
      }
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};
