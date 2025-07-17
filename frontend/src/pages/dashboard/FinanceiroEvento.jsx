import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import Financeiro from './Financeiro';

export default function FinanceiroEvento() {
  const { id } = useParams();
  const [evento, setEvento] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Buscar evento e inscrições
        const [evRes, regRes] = await Promise.all([
          api.get(`/events/${id}`),
          api.get(`/events/${id}/registrations`)
        ]);
        
        setEvento(evRes.data);
        setRegistrations(regRes.data);

        // Buscar participantes
        if (regRes.data && regRes.data.length > 0) {
          const userIds = regRes.data.map(reg => reg.user_id);
          const uniqueUserIds = [...new Set(userIds)];
          const participantsRes = await api.get('/participants', {
            params: { ids: uniqueUserIds.join(',') }
          });
          setParticipants(participantsRes.data);
        }

        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados do evento');
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;
  if (!evento) return <div>Evento não encontrado.</div>;

  return (
    <div>
      <h2>Financeiro - {evento.title}</h2>
      <Financeiro events={[evento]} registrations={registrations} participants={participants} />
    </div>
  );
} 