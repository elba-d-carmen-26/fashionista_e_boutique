import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Rating,
  Chip,
  Divider,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Pagination,
} from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart,
  ArrowBack,
  Star,
  Person,
} from "@mui/icons-material";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import productService from "../services/productService";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  // Estados del producto
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Estados de reviews
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const [totalReviewPages, setTotalReviewPages] = useState(1);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  // Cargar producto
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const product = await productService.getProductById(id);
        setProduct(product);
        setError("");
      } catch (err) {
        setError("Error al cargar el producto");
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Cargar reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const response = await productService.getProductReviews(id, {
          page: reviewPage,
        });
        setReviews(response.data.data?.reviews || []);
        setTotalReviewPages(response.data.data?.pagination?.totalPages || 1);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        setReviewsLoading(false);
      }
    };

    if (id) {
      fetchReviews();
    }
  }, [id, reviewPage]);

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({ ...product, quantity });
      setQuantity(1);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setReviewError("Debes iniciar sesión para escribir una reseña");
      return;
    }

    try {
      setReviewError("");
      await productService.addReview(id, newReview);
      setReviewSuccess("Reseña agregada exitosamente");
      setNewReview({ rating: 5, comment: "" });

      // Recargar reviews y producto
      const [reviewsResponse, productResponse] = await Promise.all([
        productService.getProductReviews(id, { page: 1 }),
        productService.getProductById(id),
      ]);

      setReviews(reviewsResponse.data.data?.reviews || []);
      setProduct(productResponse);
      setReviewPage(1);
    } catch (err) {
      setReviewError(
        err.response?.data?.message || "Error al agregar la reseña"
      );
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(price);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || "Producto no encontrado"}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/products")}>
          Volver a Productos
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Botón de regreso */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/products")}
        sx=
        {{ mb: 3 ,
           color: "#BA1C26", // color del texto
          fontWeight: "bold", // opcional, para que resalte
          "&:hover": {
            backgroundColor: "rgba(186, 28, 38, 0.1)"
          }
              }}
      >
        Volver a Productos
      </Button>

      <Grid container spacing={4}>
        {/* Imágenes del producto */}
        <Grid item xs={12} md={6}>
          <Box>
            {/* Imagen principal */}
            <Box
              component="img"
              src={
                product.images[selectedImage]?.url || "/placeholder-image.jpg"
              }
              alt={product.name}
              sx={{
                width: "100%",
                height: 400,
                objectFit: "cover",
                borderRadius: 2,
                mb: 2,
                color: "#BA1C26"
              }}
            />

            {/* Miniaturas */}
            {product.images.length > 1 && (
              <Box sx={{ display: "flex", gap: 1, overflowX: "auto" }}>
                {product.images.map((image, index) => (
                  <Box
                    key={index}
                    component="img"
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    onClick={() => setSelectedImage(index)}
                    sx={{
                      width: 80,
                      height: 80,
                      objectFit: "cover",
                      borderRadius: 1,
                      cursor: "pointer",
                      border: selectedImage === index ? 2 : 1,
                      borderColor:
                        selectedImage === index ? "primary.main" : "grey.300",
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Grid>

        {/* Información del producto */}
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom color="#BA1C26"
            sx={{ color: "#BA1C26", fontWeight: "bold" }}>

              {product.name}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Rating value={product.rating} readOnly />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({product.numReviews} reseñas)
              </Typography>
            </Box>

            <Typography
              variant="h5"
              color="#BA1C26"
              fontWeight="bold"
              sx={{ mb: 2 }}
            >
              {formatPrice(product.price)}
            </Typography>

            <Chip
              label={product.category}
              color="#BA1C26"
              variant="outlined"
              sx={{
                mb: 2,
                backgroundColor: "white",
                color: "#BA1C26",
                borderColor: "#BA1C26",
                "& .MuiChip-icon": { color: "white" },
                          }}
            />

            <Typography variant="body1" paragraph color="#BA1C26">
              {product.description}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* Stock y cantidad */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom
             sx={{
                color: "#BA1C26",
                opacity: 0.5, // entre 0 (transparente) y 1 (opaco)
              }}
             >
                Stock disponible: {product.stock} unidades
              </Typography>

              {product.stock > 0 ? (
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}
                >
                  <Typography variant="body1" color="#BA1C26" opacity="0,5">Cantidad:</Typography>
                  <Box sx={{ display: "flex", alignItems: "center",  color: "#BA1C26",
                }}>
                    <IconButton
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      sx={{
                      color: "#BA1C26",
                      "&.Mui-disabled": {
                        color: "#BA1C26", // tono del rojo con opacidad
                      },
                    }}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Typography
                      variant="h6"
                      sx={{ mx: 2, minWidth: 40, textAlign: "center" }}
                    >
                      {quantity}
                    </Typography>
                    <IconButton
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                      sx={{
                      color: "#BA1C26",
                      "&.Mui-disabled": {
                        color: "#BA1C26", // tono del rojo con opacidad
                      },
                    }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                </Box>
              ) : (
                <Chip label="Agotado" color="error" sx={{ mt: 1 }} />
              )}
            </Box>

            {/* Botón de agregar al carrito */}
            <Button
              variant="outlined"
              size="large"
              startIcon={<ShoppingCart />}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              fullWidth
              sx={{ mb: 2, 
                backgroundColor:"white",
                color: "#BA1C26",
                borderColor: "#BA1C26",
                "&:hover": {
                  backgroundColor: "#E6A4B4",
                  color: "#BA1C26",
                  borderColor: "#BA1C26",
                },

              }}
            >
              {product.stock === 0 ? "Producto Agotado" : "Agregar al Carrito"}
            </Button>

            {/* Información adicional */}
            <Paper sx={{ p: 2, mt: 2, backgroundColor: "#E6A4B4" }}>
              <Typography variant="h6" gutterBottom color="#BA1C26">
                Información del Producto
              </Typography>
              <Typography variant="body2" color="#BA1C26">
                <strong>Categoría:</strong> {product.category}
              </Typography>
              <Typography variant="body2" color="#BA1C26">
                <strong>SKU:</strong> {product._id}
              </Typography>
              {product.subcategory && (
                <Typography variant="body2" color="#BA1C26">
                  <strong>Subcategoría:</strong> {product.subcategory}
                </Typography>
              )}
            </Paper>
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Sección de reseñas */}
      <Box>
        <Typography variant="h5" gutterBottom color="#BA1C26">
          Reseñas de Clientes
        </Typography>

        {/* Formulario para nueva reseña */}
        {isAuthenticated ? (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="#BA1C26">
                Escribir una Reseña
              </Typography>

              {reviewError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {reviewError}
                </Alert>
              )}

              {reviewSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {reviewSuccess}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmitReview}>
                <Box sx={{ mb: 2 }}>
                  <Typography component="legend" color="#BA1C26">Calificación</Typography>
                  <Rating
                    value={newReview.rating}
                    onChange={(event, newValue) => {
                      setNewReview({ ...newReview, rating: newValue });
                    }}
                  />
                </Box>

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Comentario (opcional)"
                  value={newReview.comment}
                  onChange={(e) =>
                    setNewReview({ ...newReview, comment: e.target.value })
                  }
                  sx={{ mb: 2,
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
                  color: "#BA1C26"
                  }}}
                />

                <Button type="submit" variant="contained" backgroundColor="#BA1C26" startIcon={<Star />}
                sx={{
                backgroundColor: "#BA1C26",   // color de fondo
                color: "white",               // color del texto
                "&:hover": {
                  backgroundColor: "#E6A4B4", // color al pasar el mouse
                },
              }}
                            >
                  Enviar Reseña
                </Button>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Button onClick={() => navigate("/login")}>Inicia sesión</Button>{" "}
            para escribir una reseña
          </Alert>
        )}

        {/* Lista de reseñas */}
        {reviewsLoading ? (
          <Box display="flex" justifyContent="center" my={2}>
            <CircularProgress />
          </Box>
        ) : reviews.length > 0 ? (
          <>
            <List>
              {reviews.map((review) => (
                <ListItem key={review._id} alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar>
                      <Person />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography variant="subtitle1">
                          {review.user?.name || "Usuario"}
                        </Typography>
                        <Rating value={review.rating} readOnly size="small" />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(review.createdAt).toLocaleDateString(
                            "es-ES"
                          )}
                        </Typography>
                        {review.comment && (
                          <Typography variant="body1" sx={{ mt: 1 }}>
                            {review.comment}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>

            {totalReviewPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Pagination
                  count={totalReviewPages}
                  page={reviewPage}
                  onChange={(event, value) => setReviewPage(value)}
                  color="primary"
                />
              </Box>
            )}
          </>
        ) : (
          <Typography variant="body1" color="text.secondary">
            No hay reseñas para este producto aún.
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default ProductDetail;
