exports.seed = async function(knex) {
  // Limpar a tabela de transações
  await knex('transactions').del();

  // Buscar eventos e usuários existentes
  const events = await knex('events').select('id');
  const users = await knex('users').select('id');

  if (events.length === 0 || users.length === 0) {
    console.log('Não há eventos ou usuários para criar transações');
    return;
  }

  // Criar array de transações de teste
  const transactions = [];
  const paymentMethods = ['credit_card', 'pix', 'boleto'];
  const statuses = ['paid', 'pending', 'failed'];

  // Criar 50 transações aleatórias
  for (let i = 0; i < 50; i++) {
    const event = events[Math.floor(Math.random() * events.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const amount = parseFloat((Math.random() * 500 + 50).toFixed(2));

    transactions.push({
      event_id: event.id,
      user_id: user.id,
      amount: amount,
      payment_method: paymentMethod,
      status: status,
      payment_details: JSON.stringify({
        transaction_id: `tx_${Math.random().toString(36).substr(2, 9)}`,
        provider: 'test_provider'
      }),
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  // Inserir transações
  await knex('transactions').insert(transactions);
}; 