import api from "./api";

const productService = {
  // Obtener todos los productos con filtros y paginación
  getProducts: async (params = {}) => {
    try {
      const response = await api.get("/products", { params });
      const data = response.data?.data || {};

      const products = data.products || [];
      const pagination = data.pagination || null;

      // ✅ Retornamos ambos formatos: uno para Admin.js, otro para Products.js
      return {
        success: true,
        data: { products, pagination },
        products, // para frontend/Products.js
        pagination,
      };
    } catch (error) {
      console.error("Error al obtener productos:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Error al obtener productos del servidor",
        data: { products: [], pagination: null },
        products: [],
        pagination: null,
      };
    }
  },

  // Obtener un producto por ID
  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      // Devolvemos directamente el producto
      return response.data.data.product;
    } catch (error) {
      throw error.response?.data || { message: "Error al obtener el producto" };
    }
  },

  // Crear un nuevo producto (admin)
  createProduct: async (productData) => {
    try {
      const response = await api.post("/products", productData);
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al crear el producto",
      };
    }
  },

  // Actualizar un producto (admin)
  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Error al actualizar el producto" }
      );
    }
  },

  // Eliminar un producto (admin)
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Error al eliminar el producto" }
      );
    }
  },

  // Agregar reseña a un producto
  addReview: async (productId, reviewData) => {
    try {
      const response = await api.post(
        `/products/${productId}/reviews`,
        reviewData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al agregar la reseña" };
    }
  },

  // Obtener reseñas de un producto
  getProductReviews: async (productId, params = {}) => {
    try {
      const response = await api.get(`/products/${productId}/reviews`, {
        params,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al obtener las reseñas" };
    }
  },

  // Obtener categorías disponibles
  getCategories: async () => {
    try {
      const response = await api.get("/products/categories/list");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al obtener categorías" };
    }
  },

  // Buscar productos
  searchProducts: async (query, filters = {}) => {
    try {
      const params = { search: query, ...filters };
      const response = await api.get("/products", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error en la búsqueda" };
    }
  },
};

export default productService;
