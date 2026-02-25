'use strict';
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('products', [
      { category_id: 1, name: 'Ensalada César',     price: 18000, stock: 50, min_stock: 5, active: true, created_at: new Date(), updated_at: new Date() },
      { category_id: 1, name: 'Sopa del día',       price: 12000, stock: 30, min_stock: 5, active: true, created_at: new Date(), updated_at: new Date() },
      { category_id: 2, name: 'Bandeja Paisa',      price: 35000, stock: 20, min_stock: 3, active: true, created_at: new Date(), updated_at: new Date() },
      { category_id: 2, name: 'Pollo a la Plancha', price: 28000, stock: 25, min_stock: 3, active: true, created_at: new Date(), updated_at: new Date() },
      { category_id: 2, name: 'Filete de Res',      price: 45000, stock: 15, min_stock: 3, active: true, created_at: new Date(), updated_at: new Date() },
      { category_id: 3, name: 'Agua Postobón',      price: 3000,  stock: 100, min_stock: 10, active: true, created_at: new Date(), updated_at: new Date() },
      { category_id: 3, name: 'Jugo Natural',       price: 8000,  stock: 50, min_stock: 10, active: true, created_at: new Date(), updated_at: new Date() },
      { category_id: 3, name: 'Cerveza',            price: 6000,  stock: 80, min_stock: 10, active: true, created_at: new Date(), updated_at: new Date() },
      { category_id: 4, name: 'Brownie con Helado', price: 12000, stock: 20, min_stock: 5,  active: true, created_at: new Date(), updated_at: new Date() },
      { category_id: 4, name: 'Tres Leches',        price: 10000, stock: 15, min_stock: 5,  active: true, created_at: new Date(), updated_at: new Date() },
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('products', null, {});
  }
};
