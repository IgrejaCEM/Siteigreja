import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Financeiro from './Financeiro';

export default function FinanceiroWrapper() {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log('Buscando dados para o Financeiro...');
        
        const [eventsRes, registrationsRes, participantsRes] = await Promise.all([
          api.get('/admin/events'),
          api.get('/admin/registrations'),
          api.get('/admin/participants')
        ]);
        
        console.log('Eventos carregados:', eventsRes.data.length);
        console.log('Inscrições carregadas:', registrationsRes.data.length);
        console.log('Participantes carregados:', participantsRes.data.length);
        
        setEvents(eventsRes.data);
        setRegistrations(registrationsRes.data);
        setParticipants(participantsRes.data);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados financeiros. Por favor, tente novamente.');
      }
      setLoading(false);
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Carregando dados financeiros...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px',
        color: 'red',
        textAlign: 'center',
        fontSize: '16px'
      }}>
        {error}
      </div>
    );
  }

  return (
    <Financeiro 
      events={events} 
      registrations={registrations} 
      participants={participants} 
    />
  );
} 