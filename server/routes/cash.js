const express = require('express');
const { CashRegister, Order, OrderItem, Product, Table, User } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/cash/current — turno activo
router.get('/current', authMiddleware, async (req, res) => {
  try {
    const register = await CashRegister.findOne({
      where: { status: 'open' },
      include: [{ model: User, attributes: ['id', 'name'] }],
    });
    res.json(register || null);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener caja', error: error.message });
  }
});

// POST /api/cash/open — abrir turno
router.post('/open', authMiddleware, async (req, res) => {
  try {
    const existing = await CashRegister.findOne({ where: { status: 'open' } });
    if (existing) return res.status(400).json({ message: 'Ya hay un turno abierto' });

    const { initialAmount } = req.body;
    const register = await CashRegister.create({
      user_id:        req.user.id,
      initial_amount: initialAmount || 0,
      status:         'open',
      opened_at:      new Date(),
    });
    res.status(201).json(register);
  } catch (error) {
    res.status(500).json({ message: 'Error al abrir caja', error: error.message });
  }
});

// POST /api/cash/close — cerrar turno
router.post('/close', authMiddleware, async (req, res) => {
  try {
    const register = await CashRegister.findOne({ where: { status: 'open' } });
    if (!register) return res.status(404).json({ message: 'No hay turno abierto' });

    const { finalAmount, notes } = req.body;

    // Calcula total vendido en este turno
    const orders = await Order.findAll({
      where: {
        status: 'paid',
        created_at: { [require('sequelize').Op.gte]: register.opened_at }
      }
    });
    const totalSales = orders.reduce((sum, o) => sum + parseFloat(o.total), 0);

    await register.update({
      final_amount: finalAmount,
      total_sales:  totalSales,
      notes:        notes || '',
      status:       'closed',
      closed_at:    new Date(),
    });

    res.json(register);
  } catch (error) {
    res.status(500).json({ message: 'Error al cerrar caja', error: error.message });
  }
});

// GET /api/cash/summary — resumen del turno actual
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const register = await CashRegister.findOne({ where: { status: 'open' } });
    if (!register) return res.json({ open: false });

    const { Op } = require('sequelize');

    // Órdenes ya cobradas en este turno
    const paidOrders = await Order.findAll({
      where: { status: 'paid', created_at: { [Op.gte]: register.opened_at } },
      include: [
        { model: Table,     attributes: ['id', 'name'] },
        { model: OrderItem, include: [{ model: Product, attributes: ['id', 'name', 'price'] }] },
      ],
    });

    // Órdenes pendientes de cobro
    const pendingOrders = await Order.findAll({
      where: { status: 'pending_payment' },
      include: [
        { model: Table,     attributes: ['id', 'name'] },
        { model: OrderItem, include: [{ model: Product, attributes: ['id', 'name', 'price'] }] },
      ],
    });

    const totalSales  = paidOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);
    const totalOrders = paidOrders.length;

    res.json({
      open: true,
      register,
      totalSales,
      totalOrders,
      paidOrders,
      pendingOrders,   // ← nuevo
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener resumen', error: error.message });
  }
});

module.exports = router;
