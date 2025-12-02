import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Paper,
  Chip,
} from "@mui/material";
import {
  ShoppingCart,
  LocalShipping,
  Security,
  Support,
  Star,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import productService from "../services/productService";

const Home = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await productService.getProducts({ limit: 6, isFeatured: true });
setFeaturedProducts(response.data?.products || []);

        setFeaturedProducts(response.products || []);
      } catch (error) {
        console.error("Error al cargar productos destacados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      // Redirigir al login con la ubicación actual para volver después
      navigate("/login", { state: { from: { pathname: "/" } } });
      return;
    }
    addToCart(product);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(price);
  };

  const features = [
    {
      icon: <LocalShipping sx={{ fontSize: 40, color: "#BA1C26" }} />,
      title: "Envío Gratis",
      description: "Envío gratuito en pedidos superiores a 50€",
    },
    {
      icon: <Security sx={{ fontSize: 40, color: "#BA1C26" }} />,
      title: "Compra Segura",
      description: "Tus datos están protegidos con encriptación SSL",
    },
    {
      icon: <Support sx={{ fontSize: 40, color: "#BA1C26" }} />,
      title: "Soporte 24/7",
      description: "Atención al cliente disponible las 24 horas",
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #E6A4B4 0%, #BA1C26 300%)",
          
          color: "#BA1C26",
          py: 8,
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            fontWeight="bold"
            color= "#BA1C26"
          >
            Bienvenido a Fashionista e-Boutique
          </Typography>
          <Typography variant="h5" component="p" sx={{ color:  "#BA1C26", mb:2 }}>
            Descubre los mejores productos con la mejor calidad y precios
            increíbles
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/products")}
              sx={{
                borderColor: "white",                
                backgroundColor: "rgba(255,255,255,0.1)",
                color: "white",
                "&:hover": {
                  backgroundColor: "white",
                  color: "#BA1C26",
                },
              }}
            >
              Ver Productos
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/about")}
              sx={{
                borderColor: "white",
                color: "white",
                "&:hover": {
                  backgroundColor: "white",
                  color: "#BA1C26",
                },
              }}
            >
              Conoce Más
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom color="#BA1C26">
          ¿Por qué elegirnos?
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 4,
                  textAlign: "center",
                  height: "100%",
                  transition: "transform 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-5px)",
                  },
                }}
              >
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h6" component="h3" gutterBottom sx={{ color: "#BA1C26" }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="#BA1C26:" sx={{ color: "#BA1C26" }}> 
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Products Section */}
      <Box sx={{ backgroundColor: "grey.50", py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            component="h2"
            textAlign="center"
            color="#BA1C26"
            gutterBottom
          >
            Productos Destacados
          </Typography>
          <Typography
            variant="body1"
            textAlign="center"
            color="#BA1C26"
            sx={{ mb: 4 }}
          >
            Descubre nuestra selección de productos más populares
          </Typography>

          {loading ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography>Cargando productos...</Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {featuredProducts.map((product) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product._id}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.3s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: 0,
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={
                        product.images[0]?.url ||
                        "/images/placeholder.jpg" /*aqui estaba mal images?.[0]*/
                      }
                      alt={product.name}
                      sx={{ objectFit: "cover" }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography
                        gutterBottom
                        variant="h6"
                        color="#BA1C26"
                        component="h3"
                        noWrap
                      >
                        {product.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="#BA1C26"
                        sx={{ mb: 2 }}
                      >
                        {product.description?.substring(0, 100)}...
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Star sx={{ color: "gold", fontSize: 16 }} />
                        <Typography variant="body2">
                          {product.averageRating?.toFixed(1) || "0.0"} (
                          {product.reviewCount || 0})
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography
                          variant="h6"
                          color="#BA1C26"
                          fontWeight="bold"
                        >
                          {formatPrice(product.price)}
                        </Typography>
                        {product.originalPrice &&
                          product.originalPrice > product.price && (
                            <Typography
                              variant="body2"
                              sx={{
                                textDecoration: "line-through",
                                color: "#BA1C26",
                              }}
                            >
                              {formatPrice(product.originalPrice)}
                            </Typography>
                          )}
                        {product.category && (
                          <Chip
                            label={product.category}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              ml: "auto",
                              color: "#BA1C26",           // texto rojo
                              borderColor: "#BA1C26",     // borde rojo
                             fontWeight: "bold",             
                           }}
                          />
                        )}
                      </Box>
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                      size="small"
                      onClick={() => navigate(`/products/${product._id}`)}
                      sx={{
                        color: "white", // color del texto
                        border: "1px solid #BA1C26", // borde rojo
                        backgroundColor: "#E6A4B4",
                        "&:hover": {
                          backgroundColor: "white",
                          color: "#BA1C26", // fondo rojizo al pasar el mouse
                        },
                      }}
                    >
                      Ver Detalles
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<ShoppingCart />}
                        onClick={() => handleAddToCart(product)}
                        sx={{ ml: "auto",
                            color: "white", // color del texto
                            border: "1px solid #BA1C26", // borde rojo
                            backgroundColor: "#E6A4B4",
                            "&:hover": {
                            backgroundColor: "white",
                            color: "#BA1C26", // tono más oscuro al pasar el mouse
                            },
                         }}
                      >
                        Agregar
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/products")}
               sx={{
              color: "#BA1C26",           // texto rojo
              borderColor: "#BA1C26",     // borde rojo
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "#E6A4B4", // leve fondo rojizo al pasar el mouse
                borderColor: "#BA1C26",
              },
    }}
            >
              Ver Todos los Productos
            </Button>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h4" component="h2" gutterBottom color="#BA1C26">
          ¿Listo para comenzar?
        </Typography>
        <Typography variant="body1" color="#BA1C26" sx={{ mb: 4 }}>
          Únete a miles de clientes satisfechos y descubre la mejor experiencia
          de compra online
        </Typography>
        <Button
          variant="outlined"
          size="large"
          onClick={() => navigate("/register")}
          sx={{
              color: "#BA1C26",           // texto rojo
              borderColor: "#BA1C26",  
              backgroundColor: "white",   // borde rojo
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "#E6A4B4", // leve fondo rojizo al pasar el mouse
                borderColor: "#BA1C26",
              },
             }}
        >
          Crear Cuenta Gratis
        </Button>
      </Container>
    </Box>
  );
};

export default Home;
