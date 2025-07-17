import React, { useState, useEffect } from 'react';
import { Typography, Table, TableHead, TableBody, TableCell, TableRow } from '@mui/material';
import dayjs from 'dayjs';
import api from '../services/api';

const Participantes = () => {
  const [contas, setContas] = useState([]);

  useEffect(() => {
    const fetchContas = async () => {
      const res = await api.get('/admin/users');
      setContas(res.data);
    };
    fetchContas();
  }, []);

  return (
    <div>
      <Typography variant="h4" gutterBottom>Contas Criadas</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Usuário</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Data de Nascimento</TableCell>
            <TableCell>Gênero</TableCell>
            <TableCell>Data de Cadastro</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {contas.map((conta) => (
            <TableRow key={conta.id}>
              <TableCell>{conta.name}</TableCell>
              <TableCell>{conta.username}</TableCell>
              <TableCell>{conta.email}</TableCell>
              <TableCell>{conta.birthdate ? dayjs(conta.birthdate).format('DD/MM/YYYY') : '-'}</TableCell>
              <TableCell>{conta.gender || '-'}</TableCell>
              <TableCell>{conta.created_at ? dayjs(conta.created_at).format('DD/MM/YYYY HH:mm') : '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Participantes; 