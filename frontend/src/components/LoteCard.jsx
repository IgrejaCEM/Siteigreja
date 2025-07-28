import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Tooltip
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { formatPrice } from '../utils/format';

export default function LoteCard({ lote, onSelect, disabled }) {
  const now = new Date();
  const startDate = new Date(lote.start_date);
  const endDate = new Date(lote.end_date);
  
  const isActive = lote.status === 'active';
  const isInPeriod = now >= startDate && now <= endDate;
  const hasQuantity = lote.quantity > 0;
  
  const getStatus = () => {
    if (!isActive) return { label: 'Inativo', color: 'default' };
    if (!isInPeriod) {
      if (now < startDate) return { label: 'Em breve', color: 'info' };
      if (now > endDate) return { label: 'Encerrado', color: 'error' };
    }
    if (!hasQuantity) return { label: 'Esgotado', color: 'error' };
    return { label: 'Disponível', color: 'success' };
  };

  const status = getStatus();
  const isAvailable = isActive && isInPeriod && hasQuantity;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={4}>
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" component="div">
                {lote.name}
              </Typography>
              <Chip label={status.label} color={status.color} />
            </Box>

            <Typography variant="h5" color="primary" gutterBottom>
              {formatPrice(lote.price)}
            </Typography>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Início: {startDate.toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fim: {endDate.toLocaleDateString()}
              </Typography>
            </Box>



            <Box display="flex" justifyContent="center" mt={2}>
              <Tooltip title={!isAvailable ? status.label : ''}>
                <span>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => onSelect(lote)}
                    disabled={!isAvailable || disabled}
                  >
                    {isAvailable ? 'Selecionar' : status.label}
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
} 