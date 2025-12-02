const express = require("express");
const { body, query, validationResult } = require("express-validator");
const Product = require("../models/Product");
const {
  authenticateToken,
  requireAdmin,
  optionalAuth,
} = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/products
// @desc    Obtener productos con filtros y paginación
// @access  Public
router.get(
  "/",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("La página debe ser un número positivo"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("El límite debe estar entre 1 y 50"),
    query("category")
      .optional()
      .isString()
      .withMessage("La categoría debe ser texto"),
    query("minPrice")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("El precio mínimo debe ser positivo"),
    query("maxPrice")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("El precio máximo debe ser positivo"),
    query("search")
      .optional()
      .isString()
      .withMessage("La búsqueda debe ser texto"),
    query("sortBy")
      .optional()
      .isIn(["name", "price", "rating", "createdAt", "salesCount"])
      .withMessage("Campo de ordenamiento inválido"),
    query("sortOrder")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("Orden debe ser asc o desc"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Parámetros de consulta inválidos",
          errors: errors.array(),
        });
      }

      const {
        page = 1,
        limit = 12,
        category,
        subcategory,
        minPrice,
        maxPrice,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
        featured,
      } = req.query;

      // Construir filtros
      const filters = { isActive: true };

      if (category) filters.category = category;
      if (subcategory) filters.subcategory = subcategory;
      if (featured === "true") filters.isFeatured = true;

      if (minPrice || maxPrice) {
        filters.price = {};
        if (minPrice) filters.price.$gte = parseFloat(minPrice);
        if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
      }

      if (search) {
        filters.$text = { $search: search };
      }

      // Configurar ordenamiento
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

      // Ejecutar consulta con paginación
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [products, totalProducts] = await Promise.all([
        Product.find(filters)
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit))
          .select("-reviews"),
        Product.countDocuments(filters),
      ]);

      const totalPages = Math.ceil(totalProducts / parseInt(limit));

      res.json({
        success: true,
        data: {
          products,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalProducts,
            hasNextPage: parseInt(page) < totalPages,
            hasPrevPage: parseInt(page) > 1,
          },
        },
      });
    } catch (error) {
      console.error("Error obteniendo productos:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }
);

// @route   GET /api/products/:id
// @desc    Obtener producto por ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "reviews.user",
      "name avatar"
    );

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    res.json({
      success: true,
      data: { product },
    });
  } catch (error) {
    console.error("Error obteniendo producto:", error);
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "ID de producto inválido",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

// @route   POST /api/products
// @desc    Crear nuevo producto
// @access  Private (Admin)
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  [
    body("name")
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("El nombre es requerido y no puede exceder 100 caracteres"),
    body("description")
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage(
        "La descripción es requerida y no puede exceder 2000 caracteres"
      ),
    body("price")
      .isFloat({ min: 0 })
      .withMessage("El precio debe ser un número positivo"),
    body("category")
      .isIn([
        "camisas y blusas",
        "camisetas",
        "chaquetas",
        "sweaters",
        "pantalones",
        "faldas",
        "shorts",
        "vestidos",
        "enterizos",
        "otros",
      ])
      .withMessage("Categoría inválida"),
    body("stock")
      .isInt({ min: 0 })
      .withMessage("El stock debe ser un número entero positivo"),
    body("images")
      .isArray({ min: 1 })
      .withMessage("Debe incluir al menos una imagen"),

    body("images.*.url")
      .isString()
      .notEmpty()
      .withMessage("La URL de la imagen es requerida"),

    body("images.*.isPrimary")
      .optional()
      .isBoolean()
      .withMessage("El campo isPrimary debe ser booleano"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Datos de entrada inválidos",
          errors: errors.array(),
        });
      }

      const product = new Product(req.body);
      await product.save();

      res.status(201).json({
        success: true,
        message: "Producto creado exitosamente",
        data: { product },
      });
    } catch (error) {
      console.error("Error creando producto:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }
);

// @route   PUT /api/products/:id
// @desc    Actualizar producto
// @access  Private (Admin)
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("El nombre no puede exceder 100 caracteres"),
    body("description")
      .optional()
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage("La descripción no puede exceder 2000 caracteres"),
    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("El precio debe ser un número positivo"),
    body("category")
      .optional()
      .isIn([
        "camisas y blusas",
        "camisetas",
        "chaquetas",
        "sweaters",
        "pantalones",
        "faldas",
        "shorts",
        "vestidos",
        "enterizos",
        "otros",
      ])
      .withMessage("Categoría inválida"),
    body("stock")
      .optional()
      .isInt({ min: 0 })
      .withMessage("El stock debe ser un número entero positivo"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Datos de entrada inválidos",
          errors: errors.array(),
        });
      }

      const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Producto no encontrado",
        });
      }

      res.json({
        success: true,
        message: "Producto actualizado exitosamente",
        data: { product },
      });
    } catch (error) {
      console.error("Error actualizando producto:", error);
      if (error.name === "CastError") {
        return res.status(400).json({
          success: false,
          message: "ID de producto inválido",
        });
      }
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }
);

// @route   DELETE /api/products/:id
// @desc    Eliminar producto (soft delete)
// @access  Private (Admin)
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    res.json({
      success: true,
      message: "Producto eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error eliminando producto:", error);
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "ID de producto inválido",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

// @route   POST /api/products/:id/reviews
// @desc    Agregar reseña a producto
// @access  Private
router.post(
  "/:id/reviews",
  authenticateToken,
  [
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("La calificación debe estar entre 1 y 5"),
    body("comment")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("El comentario no puede exceder 500 caracteres"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Datos de entrada inválidos",
          errors: errors.array(),
        });
      }

      const product = await Product.findById(req.params.id);
      if (!product || !product.isActive) {
        return res.status(404).json({
          success: false,
          message: "Producto no encontrado",
        });
      }

      // Verificar si el usuario ya ha reseñado este producto
      const existingReview = product.reviews.find(
        (review) => review.user.toString() === req.user._id.toString()
      );

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: "Ya has reseñado este producto",
        });
      }

      // Agregar nueva reseña
      const newReview = {
        user: req.user._id,
        rating: req.body.rating,
        comment: req.body.comment || "",
      };

      product.reviews.push(newReview);
      product.updateRating();
      await product.save();

      // Poblar la información del usuario en la nueva reseña
      await product.populate("reviews.user", "name avatar");

      res.status(201).json({
        success: true,
        message: "Reseña agregada exitosamente",
        data: {
          review: product.reviews[product.reviews.length - 1],
          rating: {
            average: product.rating.average,
            count: product.rating.count,
          },
        },
      });
    } catch (error) {
      console.error("Error agregando reseña:", error);
      if (error.name === "CastError") {
        return res.status(400).json({
          success: false,
          message: "ID de producto inválido",
        });
      }
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }
);

// @route   GET /api/products/:id/reviews
// @desc    Obtener reseñas de un producto con paginación
// @access  Public
router.get(
  "/:id/reviews",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("La página debe ser un número positivo"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage("El límite debe estar entre 1 y 20"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Parámetros de consulta inválidos",
          errors: errors.array(),
        });
      }

      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      const product = await Product.findById(req.params.id);
      if (!product || !product.isActive) {
        return res.status(404).json({
          success: false,
          message: "Producto no encontrado",
        });
      }

      // Obtener reviews con paginación
      const totalReviews = product.reviews.length;
      const totalPages = Math.ceil(totalReviews / limit);

      // Ordenar reviews por fecha (más recientes primero) y aplicar paginación
      const reviews = product.reviews
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(skip, skip + parseInt(limit));

      // Poblar información del usuario
      await product.populate("reviews.user", "name avatar");

      res.json({
        success: true,
        data: {
          reviews: reviews,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalReviews,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      });
    } catch (error) {
      console.error("Error obteniendo reseñas:", error);
      if (error.name === "CastError") {
        return res.status(400).json({
          success: false,
          message: "ID de producto inválido",
        });
      }
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  }
);

// @route   GET /api/products/categories/list
// @desc    Obtener lista de categorías disponibles
// @access  Public
router.get("/categories/list", async (req, res) => {
  try {
    const categories = await Product.distinct("category", { isActive: true });

    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    console.error("Error obteniendo categorías:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

module.exports = router;
