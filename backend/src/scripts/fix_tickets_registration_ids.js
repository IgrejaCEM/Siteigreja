const { db } = require('../database/db');

async function fixTicketsRegistrationIds() {
  try {
    // Buscar tickets órfãos
    const orphanTickets = await db('tickets')
      .leftJoin('registrations', 'tickets.inscricao_id', 'registrations.id')
      .whereNull('registrations.id')
      .select('tickets.id', 'tickets.inscricao_id');

    if (orphanTickets.length === 0) {
      console.log('Nenhum ticket órfão encontrado. Todos os tickets estão consistentes.');
      process.exit(0);
    }

    console.log('Tickets órfãos encontrados:', orphanTickets.length);
    orphanTickets.forEach(t => {
      console.log(`Ticket ID: ${t.id}, inscricao_id: ${t.inscricao_id}`);
    });

    // Opcional: remover tickets órfãos
    // await db('tickets').whereIn('id', orphanTickets.map(t => t.id)).del();
    // console.log('Tickets órfãos removidos.');

    process.exit(0);
  } catch (err) {
    console.error('Erro ao verificar tickets:', err);
    process.exit(1);
  }
}

fixTicketsRegistrationIds(); 