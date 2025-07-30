import React, { useState } from 'react';
import {
  Badge,
  IconButton,
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Divider,
  Alert
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  ShoppingBasket as ShoppingBasketIcon
} from '@mui/icons-material';
import { useCart, ITEM_TYPES } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const MuiIconButton = IconButton;

const CartIcon = () => {
  const { items, removeItem, updateQuantity, total } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleRemoveItem = (item) => {
    removeItem(item.id);
  };

  const handleQuantityChange = (item, change) => {
    const newQuantity = Math.max(1, item.quantity + change);
    updateQuantity(item.id, newQuantity);
  };

  // Função segura para formatar preço
  const formatPrice = (price) => {
    const numericPrice = parseFloat(price || 0);
    return `R$ ${numericPrice.toFixed(2)}`;
  };

  // Agrupar itens por tipo
  const groupedItems = {
    tickets: items.filter(item => item.type === ITEM_TYPES.EVENT_TICKET),
    eventProducts: items.filter(item => item.type === ITEM_TYPES.EVENT_PRODUCT),
    storeProducts: items.filter(item => item.type === ITEM_TYPES.STORE_PRODUCT)
  };

  const handleCheckout = () => {
    setDrawerOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      <Badge badgeContent={items.length} color="error">
        <IconButton
          color="inherit"
          onClick={handleDrawerToggle}
          sx={{ color: 'white' }}
        >
          <ShoppingCartIcon sx={{ color: 'white' }} />
        </IconButton>
      </Badge>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            bgcolor: 'background.paper'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h2">
              🛒 Carrinho ({items.length} itens)
            </Typography>
            <IconButton onClick={handleDrawerToggle} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {items.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ShoppingCartIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Carrinho vazio
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Adicione produtos ao seu carrinho
              </Typography>
            </Box>
          ) : (
            <>
              {/* Ingressos */}
              {groupedItems.tickets.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    🎫 Ingressos
                  </Typography>
                  <List dense>
                    {groupedItems.tickets.map((item, index) => (
                      <ListItem key={`ticket-${index}`} sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                        <ListItemText
                          primary={item.name}
                          secondary={`${item.eventName} - ${formatPrice(item.price)}`}
                        />
                        <ListItemSecondaryAction>
                          <MuiIconButton
                            size="small"
                            onClick={() => handleRemoveItem(item)}
                            color="error"
                          >
                            <DeleteIcon />
                          </MuiIconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* Produtos de Eventos */}
              {groupedItems.eventProducts.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    🎁 Produtos do Evento
                  </Typography>
                  <List dense>
                    {groupedItems.eventProducts.map((item, index) => (
                      <ListItem key={`event-product-${index}`} sx={{ bgcolor: 'blue.50', mb: 1, borderRadius: 1 }}>
                        <ListItemText
                          primary={item.name}
                          secondary={`Qtd: ${item.quantity} - ${formatPrice(item.price)} cada`}
                        />
                        <ListItemSecondaryAction>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MuiIconButton
                              size="small"
                              onClick={() => handleQuantityChange(item, -1)}
                              disabled={item.quantity <= 1}
                            >
                              -
                            </MuiIconButton>
                            <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>
                              {item.quantity}
                            </Typography>
                            <MuiIconButton
                              size="small"
                              onClick={() => handleQuantityChange(item, 1)}
                            >
                              +
                            </MuiIconButton>
                            <MuiIconButton
                              size="small"
                              onClick={() => handleRemoveItem(item)}
                              color="error"
                            >
                              <DeleteIcon />
                            </MuiIconButton>
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* Produtos da Loja */}
              {groupedItems.storeProducts.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    🏪 Produtos da Loja
                  </Typography>
                  <List dense>
                    {groupedItems.storeProducts.map((item, index) => (
                      <ListItem key={`store-product-${index}`} sx={{ bgcolor: 'green.50', mb: 1, borderRadius: 1 }}>
                        <ListItemText
                          primary={item.name}
                          secondary={`Qtd: ${item.quantity} - ${formatPrice(item.price)} cada`}
                        />
                        <ListItemSecondaryAction>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MuiIconButton
                              size="small"
                              onClick={() => handleQuantityChange(item, -1)}
                              disabled={item.quantity <= 1}
                            >
                              -
                            </MuiIconButton>
                            <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>
                              {item.quantity}
                            </Typography>
                            <MuiIconButton
                              size="small"
                              onClick={() => handleQuantityChange(item, 1)}
                            >
                              +
                            </MuiIconButton>
                            <MuiIconButton
                              size="small"
                              onClick={() => handleRemoveItem(item)}
                              color="error"
                            >
                              <DeleteIcon />
                            </MuiIconButton>
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              {/* Total */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Total: {formatPrice(total)}
                </Typography>
              </Box>

              {/* Botão de Checkout */}
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleCheckout}
                startIcon={<ShoppingBasketIcon />}
                sx={{ mb: 2 }}
              >
                Finalizar Compra
              </Button>

              {/* Alertas */}
              {groupedItems.tickets.length > 0 && groupedItems.storeProducts.length > 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Você tem ingressos e produtos da loja no carrinho. Todos serão processados juntos.
                </Alert>
              )}
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default CartIcon; 