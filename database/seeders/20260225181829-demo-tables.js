'use strict';
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('tables', [
      { name: 'Mesa 1',    capacity: 4, status: 'free', created_at: new Date(), updated_at: new Date() },
      { name: 'Mesa 2',    capacity: 4, status: 'free', created_at: new Date(), updated_at: new Date() },
      { name: 'Mesa 3',    capacity: 6, status: 'free', created_at: new Date(), updated_at: new Date() },
      { name: 'Mesa 4',    capacity: 6, status: 'free', created_at: new Date(), updated_at: new Date() },
      { name: 'Mesa 5',    capacity: 2, status: 'free', created_at: new Date(), updated_at: new Date() },
      { name: 'Barra 1',   capacity: 1, status: 'free', created_at: new Date(), updated_at: new Date() },
      { name: 'Barra 2',   capacity: 1, status: 'free', created_at: new Date(), updated_at: new Date() },
      { name: 'Terraza 1', capacity: 8, status: 'free', created_at: new Date(), updated_at: new Date() },
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('tables', null, {});
  }
};
