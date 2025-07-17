import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box } from '@mui/material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const EventCard = ({ event }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  return (
    <Card sx={{ maxWidth: 345, width: '100%' }}>
      {event.imageUrl && (
        <CardMedia
          component="img"
          height="140"
          image={event.imageUrl}
          alt={event.title}
        />
      )}
      <CardContent>
        <Typography gutterBottom variant="h6" component="div">
          {event.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {event.description}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Data: {formatDate(event.date)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Local: {event.location}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EventCard; 