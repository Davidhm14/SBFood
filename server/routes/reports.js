const express = require('express');
const router  = express.Router();
const { Op }  = require('sequelize');
const { Order, OrderItem, Product, Table } = require('../models');

router.get('/daily', async (req, res) => {
  try {
    const saleDate = req.query.saleDate || new Date().toISOString().split('T')[0];

    const startDate = new Date(`${saleDate}T00:00:00.000Z`);
    const endDate   = new Date(`${saleDate}T23:59:59.999Z`);

    const reports = await Order.findAll({
      where: {
        status: 'paid',
        createdAt: { [Op.between]: [startDate, endDate] }
      },
      include: [
        {
          model: OrderItem,
          required: false,
          include: [{ model: Product, required: false }]
        },
        { model: Table, required: false }
      ],
      order: [['createdAt', 'DESC']]
    });

    const totalSales  = reports.reduce((s, o) => s + (parseFloat(o.total) || 0), 0);
    const ordersCount = reports.length;
    const avgTicket   = ordersCount > 0 ? totalSales / ordersCount : 0;

    // ✅ FIX: cubre unit_price, unitprice, unitPrice
    const map = {};
    reports.forEach(order => {
      (order.OrderItems || []).forEach(item => {
        const name      = item.Product?.name || 'N/A';
        const qty       = item.quantity || 1;
        const unitPrice = parseFloat(
          item.unit_price ?? item.unitprice ?? item.unitPrice ?? 0
        );
        if (!map[name]) map[name] = { name, qty: 0, total: 0 };
        map[name].qty   += qty;
        map[name].total += unitPrice * qty;
      });
    });

    const topProducts = Object.values(map)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    res.json({
      reports,
      summary: { totalSales, ordersCount, avgTicket, topProducts }
    });

  } catch (error) {
    console.error('❌ Reports error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
