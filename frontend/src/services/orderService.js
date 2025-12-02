import api from './api';

const orderService = {
  // Crear una nueva orden
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al crear la orden' };
    }
  },

  // Obtener órdenes del usuario
  getUserOrders: async (params = {}) => {
    try {
      const response = await api.get('/orders', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener las órdenes' };
    }
  },

  // Obtener una orden específica
  getOrderById: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener la orden' };
    }
  },

  // Cancelar una orden
  cancelOrder: async (id) => {
    try {
      const response = await api.put(`/orders/${id}/cancel`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al cancelar la orden' };
    }
  },

  // Obtener todas las órdenes (admin)
  getAllOrders: async (params = {}) => {
    try {
      const response = await api.get('/orders/admin/all', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener todas las órdenes' };
    }
  },

  // Actualizar estado de una orden (admin)
  updateOrderStatus: async (id, status) => {
    try {
      const response = await api.put(`/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar el estado de la orden' };
    }
  },

  // Obtener estadísticas de órdenes (admin)
  getOrderStats: async () => {
    try {
      const response = await api.get('/orders/admin/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener estadísticas' };
    }
  }
};

export default orderService;