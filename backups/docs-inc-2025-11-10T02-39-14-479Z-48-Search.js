import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Add as AddIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import productService from '../services/productService';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from "../utils/formatters";

const Search = () => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Cargar categorías al montar el componente
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await productService.getCategories();
      setCategories(response.data?.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSearchSubmit = useCallback(async (e) => {
  if (e && e.preventDefault) e.preventDefault();

  setLoading(true);
  setError("");

  // Mapeo del sort
  let sortByParam = "name";
  let sortOrderParam = "asc";

  switch (sortBy) {
    case "name_desc":
      sortByParam = "name";
      sortOrderParam = "desc";
      break;

    case "price_asc":
      sortByParam = "price";
      sortOrderParam = "asc";
      break;

    case "price_desc":
      sortByParam = "price";
      sortOrderParam = "desc";
      break;

    case "createdAt_desc":
      sortByParam = "createdAt";
      sortOrderParam = "desc";
      break;

    default: // name_asc
      sortByParam = "name";
      sortOrderParam = "asc";
  }

  try {
    const response = await productService.getProducts({
      search: searchTerm || undefined,
      category: selectedCategory || undefined,
      sortBy: sortByParam,
      sortOrder: sortOrderParam,
      page: currentPage,
      limit: 12
    });

    if (response.success && response.data) {
      setProducts(response.data.products || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setHasSearched(true);
    } else {
      setProducts([]);
      setTotalPages(1);
      setHasSearched(true);
    }

  } catch (err) {
    console.error("Error en la búsqueda:", err);
    setError("No se pudieron cargar los productos.");
  } finally {
    setLoading(false);
  }
}, [searchTerm, selectedCategory, sortBy, currentPage]);
 
  // Realizar búsqueda cuando cambien los parámetros
  useEffect(() => {
  if (hasSearched) {
    handleSearchSubmit();
  }
}, [selectedCategory, sortBy, currentPage, hasSearched, handleSearchSubmit]);

  const handleClearSearch = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortBy('name');
    setCurrentPage(1);
    setProducts([]);
    setHasSearched(false);
    setError('');
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      // Redirigir al login con la ubicación actual para volver después
      navigate('/login', { state: { from: { pathname: '/search' } } });
      return;
    }
    addToCart(product, 1);
  };

  const handlePageChange = (event, value) => {
  setCurrentPage(value);
  setHasSearched(true); // asegura que el useEffect vuelva a disparar la búsqueda
};


  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Título */}
      <Typography variant="h4" component="h1" gutterBottom align="center" color="#BA1C26">
        Búsqueda de Productos
      </Typography>

      {/* Formulario de búsqueda */}
      <Box component="form" onSubmit={handleSearchSubmit} 
      sx={{ 
        mb: 4 ,
        display: 'flex',
        justifyContent: 'center',
        }}>
        <Grid container spacing={2}  justifyContent="center" sx={{ maxWidth: 1000, width: '100%' }}>
          {/* Campo de búsqueda */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                 sx={{
                 
                // Color del texto y placeholder
                "& .MuiInputBase-input": {
                  color: "#BA1C26", // texto principal
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "#E6A4B4", // placeholder
                  opacity: 1,
                },
                // Color del label
                "& .MuiInputLabel-root": {
                  color: "#BA1C26",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#E6A4B4", // label al enfocar
                },
                // Color del borde (outlined)
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#BA1C26",
                  },
                  "&:hover fieldset": {
                    borderColor: "#E6A4B4", // borde al pasar el mouse
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#E6A4B4", // borde al enfocar
                  },
                },
                // Texto de ayuda o error
                "& .MuiFormHelperText-root": {
                  color: "#BA1C26",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setSearchTerm('')} size="small">
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          {/* Filtro por categoría */}
          <Grid item xs={12} md={3}>
            <FormControl
              fullWidth
              sx={{
                minWidth: 220,
                "& .MuiInputLabel-root": {
                  color: "#BA1C26",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#E6A4B4", // color del label al enfocar
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#BA1C26",
                  },
                  "&:hover fieldset": {
                    borderColor: "#E6A4B4",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#E6A4B4",
                  },
                  "& .MuiSelect-select": {
                    color: "#BA1C26", // texto principal
                  },
                },
                "& .MuiSvgIcon-root": {
                  color: "#BA1C26", // color del ícono de flecha
                },
                "& .MuiFormHelperText-root": {
                  color: "#BA1C26",
                },
              }}
            >
              <InputLabel>Categoría</InputLabel>
              <Select
                value={selectedCategory}
                label="Categoría"
                onChange={(e) => setSelectedCategory(e.target.value)}
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


          {/* Ordenamiento */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth sx={{ minWidth: 160 ,

      
                "& .MuiInputLabel-root": {
                  color: "#BA1C26",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#E6A4B4", // color del label al enfocar
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#BA1C26",
                  },
                  "&:hover fieldset": {
                    borderColor: "#E6A4B4",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#E6A4B4",
                  },
                  "& .MuiSelect-select": {
                    color: "#BA1C26", // texto principal
                  },
                },
                "& .MuiSvgIcon-root": {
                  color: "#BA1C26", // color del ícono de flecha
                },
                "& .MuiFormHelperText-root": {
                  color: "#BA1C26",
                },
              
            }}>
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={sortBy}
                label="Ordenar por"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="name_asc">Nombre A → Z</MenuItem>
                <MenuItem value="name_desc">Nombre Z → A</MenuItem>
                <MenuItem value="price_asc">Precio: Menor → Mayor</MenuItem>
                <MenuItem value="price_desc">Precio: Mayor → Menor</MenuItem>
                <MenuItem value="createdAt_desc">Más recientes</MenuItem>
              </Select>

            </FormControl>
          </Grid>

          {/* Botón de búsqueda */}
          <Grid item xs={12} md={1}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ height: 56, backgroundColor: "#BA1C26"}}
              startIcon={<SearchIcon />}
            >
              Buscar
            </Button>
          </Grid>
        </Grid>

        {/* Botón limpiar filtros */}
        {(searchTerm || selectedCategory || hasSearched) && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              variant="outlined"
              onClick={handleClearSearch}
              startIcon={<ClearIcon />}
            >
              Limpiar búsqueda
            </Button>
          </Box>
        )}
      </Box>

      {/* Filtros activos */}
      {(searchTerm || selectedCategory) && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Filtros activos:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {searchTerm && (
              <Chip
                label={`Búsqueda: "${searchTerm}"`}
                onDelete={() => setSearchTerm('')}
                color="primary"
                variant="outlined"
              />
            )}
            {selectedCategory && (
              <Chip
                label={`Categoría: ${selectedCategory}`}
                onDelete={() => setSelectedCategory('')}
                color="secondary"
                variant="outlined"
              /> 
            )}
          </Box>
        </Box>
      )}

      {/* Estado de carga */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Mensaje inicial */}
      {!hasSearched && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <FilterIcon sx={{ fontSize: 64, color: '#BA1C26', mb: 2 }} />
          <Typography variant="h6" color="#BA1C26" gutterBottom>
            Utiliza el formulario de arriba para buscar productos
          </Typography>
          <Typography variant="body2" color="#BA1C26">
            Puedes buscar por nombre, filtrar por categoría y ordenar los resultados
          </Typography>
        </Box>
      )}

      {/* Resultados de búsqueda */}
      {hasSearched && !loading && products.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No se encontraron productos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Intenta con otros términos de búsqueda o filtros diferentes
          </Typography>
        </Box>
      )}

      {/* Grid de productos */}
      {products.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom>
            Resultados de búsqueda ({products.length} productos)
          </Typography>
          
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


          {/* Paginación */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default Search;