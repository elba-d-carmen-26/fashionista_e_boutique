import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Box,
  Chip,
  Rating,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Add as AddIcon, Search as SearchIcon } from "@mui/icons-material";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import productService from "../services/productService";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../utils/formatters";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

const fetchProducts = useCallback(async () => {
  setLoading(true);
  try {
    let sortByParam = 'name';
    let sortOrderParam = 'asc';

    switch (sortBy) {
      case 'price_asc':
        sortByParam = 'price';
        sortOrderParam = 'asc';
        break;
      case 'price_desc':
        sortByParam = 'price';
        sortOrderParam = 'desc';
        break;
      case 'createdAt_desc':
        sortByParam = 'createdAt';
        sortOrderParam = 'desc';
        break;
      case 'rating_desc':
        sortByParam = 'rating';
        sortOrderParam = 'desc';
        break;
      default:
        sortByParam = 'name';
        sortOrderParam = 'asc';
    }

    const params = {
      page: currentPage,
      limit: 12,
      sortBy: sortByParam,
      sortOrder: sortOrderParam,
      ...(searchTerm && { search: searchTerm }),
      ...(selectedCategory && { category: selectedCategory }),
    };

    const res = await productService.getProducts(params);
    // productService.getProducts devuelve response.data del axios -> { success, data: { products, pagination } }
    const body = res; // res es ya response.data (según tu productService)
    const data = (body && body.data) ? body.data : body; // compatibilidad si hay variaciones

    const productsList = data?.products || [];
    const pagination = data?.pagination || {};

    setProducts(productsList);
    setTotalPages(pagination.totalPages || 1);
    setTotalProducts(pagination.totalProducts || productsList.length || 0);

    setError('');
  } catch (err) {
    setError('Error al cargar los productos');
    console.error('Error fetching products:', err);
  } finally {
    setLoading(false);
  }
}, [currentPage, sortBy, searchTerm, selectedCategory]);


  const fetchCategories = async () => {
    try {
      const response = await productService.getCategories();
      setCategories(response.data?.categories || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      // Redirigir al login con la ubicación actual para volver después
      navigate("/login", { state: { from: { pathname: "/products" } } });
      return;
    }
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url || "/placeholder-image.jpg",
      quantity: 1,
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSortBy("name");
    setCurrentPage(1);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, color: "#BA1C26" }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Productos
      </Typography>

      {/* Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Buscar productos"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ mr: 1, color: "action.active" }} />
                ),
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={selectedCategory}
                label="Categoría"
                onChange={handleCategoryChange}
              >
                <MenuItem value="">Todas las categorías</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={sortBy}
                label="Ordenar por"
                onChange={handleSortChange}
              >
                <MenuItem value="name_asc">Nombre</MenuItem>
                <MenuItem value="price_asc">Precio: Menor a Mayor</MenuItem>
                <MenuItem value="price_desc">Precio: Mayor a Menor</MenuItem>
                <MenuItem value="createdAt_desc">Más Recientes</MenuItem>
              </Select>
            </FormControl>

          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <Button fullWidth variant="outlined" 
            onClick={clearFilters}
             sx={{
              color: "white",  
              backgroundColor: "#E6A4B4" ,  // texto rojo
              borderColor: "#BA1C26",     // borde rojo
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "white", 
                color: "#BA1C26",// leve fondo rojizo al pasar el mouse
                borderColor: "#BA1C26",
              },
            }}
        >
              Limpiar Filtros
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Results Info */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="#BA1C26:">
          Mostrando {products.length} de {totalProducts} productos
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Products Grid */}
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid key={product._id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.images[0]?.url || "/placeholder-image.jpg"}
                    alt={product.name}
                    sx={{ objectFit: "cover", cursor: "pointer" }}
                    onClick={() => navigate(`/products/${product._id}`)}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      gutterBottom
                      variant="h6"
                      component="h2"
                      noWrap
                      sx={{
                        color: "#BA1C26",
                        cursor: "pointer",
                        fontWeight: "bold",
                       "&:hover": { color: "#E6A4B4" },
                      }}
                      onClick={() => navigate(`/products/${product._id}`)}
                    >
                      {product.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="#BA1C26"
                      sx={{ mb: 1 }}
                    >
                      {product.description.length > 100
                        ? `${product.description.substring(0, 100)}...`
                        : product.description}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Rating value={product.rating} readOnly size="small" />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                      </Typography>
                    </Box>

                    <Chip
                      label={product.category}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{
                         mb: 1, 
                         color: "#BA1C26",        // texto rojo
                        borderColor: "#BA1C26",  // borde rojo
                        fontWeight: "bold",
          }}
                    />

                    <Typography variant="h6" color="#BA1C26" fontWeight="bold">
                      {formatPrice(product.price)}
                    </Typography>

                    {product.stock === 0 && (
                      <Chip
                        label="Agotado"
                        color="error"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </CardContent>

                  <CardActions>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => handleAddToCart(product)}
                      sx={{
                            color: "white", // 🔴 nombre en rojo
                            backgroundColor: "#E6A4B4",
                            cursor: "pointer",
                            fontWeight: "bold",
                            borderColor: "#BA1C26",
                            "&:hover": { color: "#BA1C26", backgroundColor:"white" }, // cambia a rosa claro al pasar el mouse
                          }}
                      disabled={product.stock === 0}
                      fullWidth
                    >
                      {product.stock === 0 ? "Agotado" : "Agregar al Carrito"}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4, }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}

          {products.length === 0 && !loading && (
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No se encontraron productos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Intenta ajustar los filtros de búsqueda
              </Typography>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default Products;
