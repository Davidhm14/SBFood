const express = require('express');
const { Table } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/tables — obtener todas las mesas
router.get('/', authMiddleware, async (req, res) => {
  try {
    const tables = await Table.findAll({ 
      order: [['name', 'ASC']] 
    });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener mesas', error: error.message });
  }
});

// POST /api/tables — crear nueva mesa
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, capacity } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'El nombre de la mesa es requerido' });
    }

    const table = await Table.create({
      name: name.trim(),
      capacity: parseInt(capacity) || 4,
      status: 'free'
    });
    
    res.status(201).json(table);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear mesa', error: error.message });
  }
});

// GET /api/tables/:id — obtener mesa específica
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const table = await Table.findByPk(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Mesa no encontrada' });
    }
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener mesa', error: error.message });
  }
});

// PUT /api/tables/:id — editar mesa completa
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, capacity } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'El nombre de la mesa es requerido' });
    }

    const table = await Table.findByPk(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Mesa no encontrada' });
    }

    await table.update({
      name: name.trim(),
      capacity: parseInt(capacity) || 4
    });
    
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar mesa', error: error.message });
  }
});

// PATCH /api/tables/:id/status — cambiar SOLO estado
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['free', 'occupied', 'pending'].includes(status)) {
      return res.status(400).json({ 
        message: 'Status válido: free, occupied, pending' 
      });
    }

    const table = await Table.findByPk(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Mesa no encontrada' });
    }

    await table.update({ status });
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar estado', error: error.message });
  }
});

// DELETE /api/tables/:id — eliminar mesa
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const table = await Table.findByPk(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Mesa no encontrada' });
    }

    // Verificar que no tenga comandas abiertas
    const { Order } = require('../models');
    const activeOrders = await Order.count({
      where: { 
        table_id: table.id,
        status: { [require('sequelize').Op.in]: ['open', 'pending_payment'] }
      }
    });

    if (activeOrders > 0) {
      return res.status(400).json({ 
        message: 'No se puede eliminar mesa con comandas activas' 
      });
    }

    await table.destroy();
    res.json({ message: 'Mesa eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar mesa', error: error.message });
  }
});

module.exports = router;
