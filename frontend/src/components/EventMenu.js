import React from 'react';
import { Link } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Payment as PaymentIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

const EventMenu = ({ eventId, onDelete }) => {
  return (
    <List>
      <ListItem button component={Link} to={`/events/${eventId}/edit`}>
        <ListItemIcon>
          <EditIcon />
        </ListItemIcon>
        <ListItemText primary="Editar Evento" />
      </ListItem>

      <ListItem button component={Link} to={`/events/${eventId}/payment-settings`}>
        <ListItemIcon>
          <PaymentIcon />
        </ListItemIcon>
        <ListItemText primary="Configurações de Pagamento" />
      </ListItem>

      <ListItem button component={Link} to={`/events/${eventId}/payment-summary`}>
        <ListItemIcon>
          <AssessmentIcon />
        </ListItemIcon>
        <ListItemText primary="Resumo de Pagamentos" />
      </ListItem>

      <Divider />

      <ListItem button onClick={onDelete} sx={{ color: 'error.main' }}>
        <ListItemIcon>
          <DeleteIcon color="error" />
        </ListItemIcon>
        <ListItemText primary="Excluir Evento" />
      </ListItem>
    </List>
  );
};

export default EventMenu; 