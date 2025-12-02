import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import {
  Inventory,
  ShoppingCart,
  Edit,
  Delete,
  Add,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import productService from "../services/productService";
import orderService from "../services/orderService";

const Admin = () => {
  const [tabValue, setTabValue] = useState(0);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Product form state
  const [productDialog, setProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    images: [],
  });

  // Order status update
  const [orderStatusDialog, setOrderStatusDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newOrderStatus, setNewOrderStatus] = useState("");

  const { user } = useAuth();

  useEffect(() => {
    if (tabValue === 0) {
      fetchProducts();
    } else if (tabValue === 1) {
      fetchOrders();
    }
  }, [tabValue]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getProducts({ limit: 50 });
      if (response.success && response.data && response.data.products) {
        setProducts(response.data.products);
      } else {
        setError("Error al cargar productos: Respuesta inválida");
      }
    } catch (err) {
      console.error("Error al cargar productos:", err);
      setError(
        `Error al cargar productos: ${err.message || "Error desconocido"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderService.getAllOrders();
      if (response.success && response.data && response.data.orders) {
        setOrders(response.data.orders);
      } else {
        setError("Error al cargar pedidos: Respuesta inválida");
      }
    } catch (err) {
      console.error("Error al cargar pedidos:", err);
      setError(
        `Error al cargar pedidos: ${err.message || "Error desconocido"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError("");
    setSuccess("");
  };

  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProductSubmit = async () => {
    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        images: [
          {
            url: productForm.imageUrl,
            alt: productForm.name,
            isPrimary: true,
          },
        ],
      };

      let response;

      if (editingProduct) {
        response = await productService.updateProduct(
          editingProduct._id,
          productData
        );
      } else {
        response = await productService.createProduct(productData);
      }

      // 🔍 Verificamos si el backend respondió con éxito real
      if (response?.success) {
        setSuccess(
          editingProduct
            ? "Producto actualizado correctamente"
            : "Producto creado correctamente"
        );

        // Limpiar formulario y cerrar modal
        setProductDialog(false);
        setEditingProduct(null);
        setProductForm({
          name: "",
          description: "",
          price: "",
          category: "",
          stock: "",
          images: [],
        });

        // Refrescar lista
        fetchProducts();
      } else {
        // 🔴 Mostrar mensaje real del backend si algo falló
        const errorMsg = response?.message || "Error al guardar el producto";
        setError(errorMsg);

        // Si el backend devuelve validaciones detalladas, las mostramos en consola
        if (response?.errors) {
          console.error("❌ Errores de validación:", response.errors);
        }
      }
    } catch (err) {
      console.error("❌ Error inesperado al guardar producto:", err);
      setError(err?.message || "Error inesperado al guardar el producto");
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      images: product.images || [],
      imageUrl: product.images?.[0]?.url || "",
    });
    setProductDialog(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar este producto?")
    ) {
      try {
        await productService.deleteProduct(productId);
        setSuccess("Producto eliminado correctamente");
        fetchProducts();
      } catch (err) {
        setError("Error al eliminar el producto");
      }
    }
  };

  const handleUpdateOrderStatus = async () => {
    try {
      await orderService.updateOrderStatus(selectedOrder._id, newOrderStatus);
      setSuccess("Estado del pedido actualizado");
      setOrderStatusDialog(false);
      setSelectedOrder(null);
      setNewOrderStatus("");
      fetchOrders();
    } catch (err) {
      setError("Error al actualizar el estado del pedido");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "processing":
        return "info";
      case "shipped":
        return "primary";
      case "delivered":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "processing":
        return "Procesando";
      case "shipped":
        return "Enviado";
      case "delivered":
        return "Entregado";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom color="#BA1C26">
        Panel de Administración
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper elevation={3}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ 
            borderBottom: 1, borderColor: 'divider',
                  "& .MuiTab-root": {
            color: "#BA1C26", // color de texto e ícono por defecto
            fontWeight: 500,
            textTransform: "none",
            "&:hover": {
              color: "#A2171F", // color al pasar el mouse
            },
    },
          }}
        >
          <Tab icon={<Inventory />} label="Productos" />
          <Tab icon={<ShoppingCart />} label="Pedidos" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Products Tab */}
          {tabValue === 0 && (
            <Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography variant="h6">Gestión de Productos</Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setProductDialog(true)}
                  sx={{backgroundColor: "#BA1C26"}}
                >
                  Nuevo Producto
                </Button>
              </Box>

              {loading ? (
                <Box display="flex" justifyContent="center" my={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Categoría</TableCell>
                        <TableCell>Precio</TableCell>
                        <TableCell>Stock</TableCell>
                        <TableCell>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product._id}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>${product.price.toFixed(2)}</TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell>
                            <IconButton
                              onClick={() => handleEditProduct(product)}
                              color="primary"
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDeleteProduct(product._id)}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {/* Orders Tab */}
          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Gestión de Pedidos
              </Typography>

              {loading ? (
                <Box display="flex" justifyContent="center" my={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Número</TableCell>
                        <TableCell>Cliente</TableCell>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Total</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order._id}>
                          <TableCell>#{order.orderNumber}</TableCell>
                          <TableCell>
                            {order.user?.name || "Usuario eliminado"}
                          </TableCell>
                          <TableCell>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusText(order.status)}
                              color={getStatusColor(order.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              onClick={() => {
                                setSelectedOrder(order);
                                setNewOrderStatus(order.status);
                                setOrderStatusDialog(true);
                              }}
                            >
                              Cambiar Estado
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Product Dialog */}
      <Dialog
        open={productDialog}
        onClose={() => setProductDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingProduct ? "Editar Producto" : "Nuevo Producto"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre"
                name="name"
                value={productForm.name}
                onChange={handleProductFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Categoría"
                name="category"
                value={productForm.category}
                onChange={handleProductFormChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                name="description"
                value={productForm.description}
                onChange={handleProductFormChange}
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Precio"
                name="price"
                type="number"
                value={productForm.price}
                onChange={handleProductFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Stock"
                name="stock"
                type="number"
                value={productForm.stock}
                onChange={handleProductFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="URL de la imagen"
                value={productForm.imageUrl || ""}
                onChange={(e) =>
                  setProductForm({ ...productForm, imageUrl: e.target.value })
                }
                fullWidth
                margin="dense"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductDialog(false)}>Cancelar</Button>
          <Button onClick={handleProductSubmit} variant="contained">
            {editingProduct ? "Actualizar" : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Status Dialog */}
      <Dialog
        open={orderStatusDialog}
        onClose={() => setOrderStatusDialog(false)}
      >
        <DialogTitle>Cambiar Estado del Pedido</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={newOrderStatus}
              label="Estado"
              onChange={(e) => setNewOrderStatus(e.target.value)}
            >
              <MenuItem value="pending">Pendiente</MenuItem>
              <MenuItem value="processing">Procesando</MenuItem>
              <MenuItem value="shipped">Enviado</MenuItem>
              <MenuItem value="delivered">Entregado</MenuItem>
              <MenuItem value="cancelled">Cancelado</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderStatusDialog(false)}>Cancelar</Button>
          <Button onClick={handleUpdateOrderStatus} variant="contained">
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Admin;
