const express = require('express');
const { Order, OrderItem, Product, Table } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/orders — comandas activas
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { status: ['open', 'in_progress'] },
      include: [
        { model: Table,     attributes: ['id', 'name'] },
        { model: OrderItem, include: [{ model: Product, attributes: ['id', 'name', 'price'] }] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener comandas', error: error.message });
  }
});

// GET /api/orders/table/:tableId — comanda activa de una mesa
router.get('/table/:tableId', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { table_id: req.params.tableId, status: ['open'] },
      include: [
        { model: Table,     attributes: ['id', 'name'] },
        { model: OrderItem, include: [{ model: Product, attributes: ['id', 'name', 'price'] }] },
      ],
    });
    res.json(order || null);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener comanda', error: error.message });
  }
});

// POST /api/orders — crear nueva comanda
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { tableId, notes } = req.body;

    await Table.update({ status: 'occupied' }, { where: { id: tableId } });

    const order = await Order.create({
      table_id: tableId,
      user_id:  req.user.id,
      status:   'open',
      notes:    notes || '',
      total:    0,
    });

    const full = await Order.findByPk(order.id, {
      include: [
        { model: Table,     attributes: ['id', 'name'] },
        { model: OrderItem, include: [{ model: Product, attributes: ['id', 'name', 'price'] }] },
      ],
    });

    res.status(201).json(full);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear comanda', error: error.message });
  }
});

// POST /api/orders/:id/items — agregar item
router.post('/:id/items', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const order   = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Comanda no encontrada' });

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

    const existing = await OrderItem.findOne({
      where: { order_id: order.id, product_id: productId }
    });

    if (existing) {
      await existing.update({ quantity: existing.quantity + quantity });
    } else {
      await OrderItem.create({
        order_id:   order.id,
        product_id: productId,
        quantity:   quantity,
        unit_price: product.price,
      });
    }

    const items = await OrderItem.findAll({ where: { order_id: order.id } });
    const total = items.reduce((sum, i) => sum + (parseFloat(i.unit_price) * i.quantity), 0);
    await order.update({ total });

    const full = await Order.findByPk(order.id, {
      include: [
        { model: Table,     attributes: ['id', 'name'] },
        { model: OrderItem, include: [{ model: Product, attributes: ['id', 'name', 'price'] }] },
      ],
    });

    res.json(full);
  } catch (error) {
    res.status(500).json({ message: 'Error al agregar item', error: error.message });
  }
});

// DELETE /api/orders/:id/items/:itemId — eliminar item
router.delete('/:id/items/:itemId', authMiddleware, async (req, res) => {
  try {
    const item = await OrderItem.findByPk(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item no encontrado' });
    await item.destroy();

    const order = await Order.findByPk(req.params.id);
    const items = await OrderItem.findAll({ where: { order_id: order.id } });
    const total = items.reduce((sum, i) => sum + (parseFloat(i.unit_price) * i.quantity), 0);
    await order.update({ total });

    res.json({ message: 'Item eliminado', total });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar item', error: error.message });
  }
});

// PATCH /api/orders/:id/status — cambiar estado
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Comanda no encontrada' });

    await order.update({ status });

    if (['paid', 'cancelled'].includes(status)) {
      await Table.update({ status: 'free' }, { where: { id: order.table_id } });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar estado', error: error.message });
  }
});

module.exports = router;
