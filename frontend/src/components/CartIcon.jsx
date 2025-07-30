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
  IconButton as MuiIconButton,
  Button,
  Divider,
  Chip,
  Alert
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useCart, ITEM_TYPES } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const CartIcon = () => {
  const { items, total, itemCount, removeItem, updateQuantity } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpenDrawer = () => {
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  const handleRemoveItem = (item) => {
    removeItem(item);
  };

  const handleQuantityChange = (item, change) => {
    const newQuantity = Math.max(1, item.quantity + change);
    updateQuantity(item, newQuantity);
  };

  const handleCheckout = () => {
    setDrawerOpen(false);
    navigate('/checkout');
  };

  const getItemTypeLabel = (type) => {
    switch (type) {
      case ITEM_TYPES.EVENT_TICKET:
        return 'Ingresso';
      case ITEM_TYPES.EVENT_PRODUCT:
        return 'Produto do Evento';
      case ITEM_TYPES.STORE_PRODUCT:
        return 'Produto da Loja';
      default:
        return 'Item';
    }
  };

  const groupItemsByType = () => {
    const grouped = {
      tickets: items.filter(item => item.type === ITEM_TYPES.EVENT_TICKET),
      eventProducts: items.filter(item => item.type === ITEM_TYPES.EVENT_PRODUCT),
      storeProducts: items.filter(item => item.type === ITEM_TYPES.STORE_PRODUCT)
    };
    return grouped;
  };

  const groupedItems = groupItemsByType();

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleOpenDrawer}
        sx={{ position: 'relative' }}
      >
        <Badge badgeContent={itemCount} color="error">
          <ShoppingCartIcon />
        </Badge>
      </IconButton>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDrawer}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 } }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h2">
              Carrinho ({itemCount} itens)
            </Typography>
            <IconButton onClick={handleCloseDrawer}>
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
                          secondary={`${item.eventName} - R$ ${item.price.toFixed(2)}`}
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
                    🛍️ Produtos de Eventos
                  </Typography>
                  <List dense>
                    {groupedItems.eventProducts.map((item, index) => (
                      <ListItem key={`event-product-${index}`} sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                        <ListItemText
                          primary={item.name}
                          secondary={`${item.eventName} - R$ ${item.price.toFixed(2)}`}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MuiIconButton
                            size="small"
                            onClick={() => handleQuantityChange(item, -1)}
                            disabled={item.quantity <= 1}
                          >
                            <RemoveIcon />
                          </MuiIconButton>
                          <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>
                            {item.quantity}
                          </Typography>
                          <MuiIconButton
                            size="small"
                            onClick={() => handleQuantityChange(item, 1)}
                          >
                            <AddIcon />
                          </MuiIconButton>
                          <MuiIconButton
                            size="small"
                            onClick={() => handleRemoveItem(item)}
                            color="error"
                          >
                            <DeleteIcon />
                          </MuiIconButton>
                        </Box>
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
                      <ListItem key={`store-product-${index}`} sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                        <ListItemText
                          primary={item.name}
                          secondary={`R$ ${item.price.toFixed(2)}`}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MuiIconButton
                            size="small"
                            onClick={() => handleQuantityChange(item, -1)}
                            disabled={item.quantity <= 1}
                          >
                            <RemoveIcon />
                          </MuiIconButton>
                          <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>
                            {item.quantity}
                          </Typography>
                          <MuiIconButton
                            size="small"
                            onClick={() => handleQuantityChange(item, 1)}
                          >
                            <AddIcon />
                          </MuiIconButton>
                          <MuiIconButton
                            size="small"
                            onClick={() => handleRemoveItem(item)}
                            color="error"
                          >
                            <DeleteIcon />
                          </MuiIconButton>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              {/* Total */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Total:
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  R$ {total.toFixed(2)}
                </Typography>
              </Box>

              {/* Botão de Checkout */}
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleCheckout}
                sx={{ mb: 2 }}
              >
                Finalizar Compra
              </Button>

              {/* Aviso sobre tipos de itens */}
              {groupedItems.tickets.length > 0 && (groupedItems.eventProducts.length > 0 || groupedItems.storeProducts.length > 0) && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Você tem ingressos e produtos no carrinho. Todos serão processados juntos.
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