const express = require('express');
const mongoose = require('mongoose');
const { body, query, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/orders
// @desc    Crear nueva orden
// @access  Private
router.post('/', authenticateToken, [
  body('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un producto'),
  body('items.*.product').isMongoId().withMessage('ID de producto inválido'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('La cantidad debe ser un número positivo'),
  body('paymentMethod').isIn(['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery']).withMessage('Método de pago inválido'),
  body('shippingAddress.fullName').trim().notEmpty().withMessage('Nombre completo es requerido'),
  body('shippingAddress.street').trim().notEmpty().withMessage('Dirección es requerida'),
  body('shippingAddress.city').trim().notEmpty().withMessage('Ciudad es requerida'),
  body('shippingAddress.state').trim().notEmpty().withMessage('Estado es requerido'),
  body('shippingAddress.zipCode').trim().notEmpty().withMessage('Código postal es requerido'),
  body('shippingAddress.country').trim().notEmpty().withMessage('País es requerido'),
  body('shippingAddress.phone').trim().notEmpty().withMessage('Teléfono es requerido')
], async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { items, paymentMethod, shippingAddress, billingAddress, notes } = req.body;

    // Iniciar transacción para garantizar atomicidad
    await session.startTransaction();

    // Verificar productos y calcular totales
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      // Usar findOneAndUpdate con session para evitar condiciones de carrera
      const product = await Product.findOneAndUpdate(
        { 
          _id: item.product, 
          isActive: true, 
          stock: { $gte: item.quantity } 
        },
        { 
          $inc: { 
            stock: -item.quantity, 
            salesCount: item.quantity 
          } 
        },
        { 
          new: false, // Retorna el documento antes de la actualización
          session 
        }
      );
      
      if (!product) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Producto ${item.product} no encontrado, no disponible o stock insuficiente`
        });
      }

      const itemPrice = product.getDiscountedPrice();
      const itemTotal = itemPrice * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: itemPrice,
        quantity: item.quantity,
        image: product.images.length > 0 ? product.images[0].url : ''
      });
    }

    // Calcular impuestos y envío (puedes personalizar estos cálculos)
    const tax = subtotal * 0.16; // 16% IVA
    const shipping = subtotal > 500 ? 0 : 50; // Envío gratis para compras > $500
    const total = subtotal + tax + shipping;

    // Crear orden
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      subtotal,
      tax,
      shipping,
      total,
      paymentMethod,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      notes: notes || {}
    });

    // Agregar evento inicial al timeline
    order.addTimelineEvent('pending', 'Orden creada');

    await order.save({ session });

    // Confirmar transacción
    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente',
      data: { order }
    });

  } catch (error) {
    // Revertir transacción en caso de error
    await session.abortTransaction();
    console.error('Error creando orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    // Cerrar sesión
    session.endSession();
  }
});

// @route   GET /api/orders
// @desc    Obtener órdenes del usuario
// @access  Private
router.get('/', authenticateToken, [
  query('page').optional().isInt({ min: 1 }).withMessage('La página debe ser un número positivo'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('El límite debe estar entre 1 y 50'),
  query('status').optional().isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).withMessage('Estado inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Parámetros de consulta inválidos',
        errors: errors.array()
      });
    }

    const { page = 1, limit = 10, status } = req.query;

    // Construir filtros
    const filters = { user: req.user._id };
    if (status) filters.status = status;

    // Ejecutar consulta con paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [orders, totalOrders] = await Promise.all([
      Order.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('items.product', 'name images'),
      Order.countDocuments(filters)
    ]);

    const totalPages = Math.ceil(totalOrders / parseInt(limit));

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalOrders,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo órdenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Obtener orden específica
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Verificar que el usuario sea el propietario o admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver esta orden'
      });
    }

    res.json({
      success: true,
      data: { order }
    });

  } catch (error) {
    console.error('Error obteniendo orden:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de orden inválido'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancelar orden
// @access  Private
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Verificar que el usuario sea el propietario
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para cancelar esta orden'
      });
    }

    // Verificar si se puede cancelar
    if (!order.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Esta orden no puede ser cancelada en su estado actual'
      });
    }

    // Iniciar transacción
    await session.startTransaction();

    // Restaurar stock de productos de forma atómica
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product, 
        {
          $inc: { 
            stock: item.quantity,
            salesCount: -item.quantity
          }
        },
        { session }
      );
    }

    // Actualizar orden
    order.addTimelineEvent('cancelled', 'Orden cancelada por el usuario');
    await order.save({ session });

    // Confirmar transacción
    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Orden cancelada exitosamente',
      data: { order }
    });

  } catch (error) {
    // Revertir transacción en caso de error
    await session.abortTransaction();
    console.error('Error cancelando orden:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de orden inválido'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    // Cerrar sesión
    session.endSession();
  }
});

// @route   GET /api/orders/admin/all
// @desc    Obtener todas las órdenes (Admin)
// @access  Private (Admin)
router.get('/admin/all', authenticateToken, requireAdmin, [
  query('page').optional().isInt({ min: 1 }).withMessage('La página debe ser un número positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('El límite debe estar entre 1 y 100'),
  query('status').optional().isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).withMessage('Estado inválido'),
  query('paymentStatus').optional().isIn(['pending', 'paid', 'failed', 'refunded']).withMessage('Estado de pago inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Parámetros de consulta inválidos',
        errors: errors.array()
      });
    }

    const { page = 1, limit = 20, status, paymentStatus, search } = req.query;

    // Construir filtros
    const filters = {};
    if (status) filters.status = status;
    if (paymentStatus) filters.paymentStatus = paymentStatus;
    if (search) {
      filters.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: search, $options: 'i' } }
      ];
    }

    // Ejecutar consulta con paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [orders, totalOrders] = await Promise.all([
      Order.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('user', 'name email')
        .populate('items.product', 'name'),
      Order.countDocuments(filters)
    ]);

    const totalPages = Math.ceil(totalOrders / parseInt(limit));

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalOrders,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo órdenes (admin):', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Actualizar estado de orden (Admin)
// @access  Private (Admin)
router.put('/:id/status', authenticateToken, requireAdmin, [
  body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).withMessage('Estado inválido'),
  body('note').optional().trim().isLength({ max: 500 }).withMessage('La nota no puede exceder 500 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { status, note = '' } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Agregar evento al timeline
    order.addTimelineEvent(status, note);
    await order.save();

    res.json({
      success: true,
      message: 'Estado de orden actualizado exitosamente',
      data: { order }
    });

  } catch (error) {
    console.error('Error actualizando estado de orden:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de orden inválido'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;