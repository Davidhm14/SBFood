'use strict';
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('categories', [
      { name: 'Entradas',      active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Platos Fuertes',active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Bebidas',       active: true, created_at: new Date(), updated_at: new Date() },
      { name: 'Postres',       active: true, created_at: new Date(), updated_at: new Date() },
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('categories', null, {});
  }
};
