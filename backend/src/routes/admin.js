const express = require('express');
const router = express.Router();
const { db } = require('../database/db');
// const { authenticateToken, requireAdmin } = require('../middleware');

// Página do painel admin
router.get('/', async (req, res) => {
  try {
    // Buscar estatísticas
    const stats = await db('events').count('* as total');
    
    // Buscar configurações
    const settings = await db('settings').first();
    let title = '';
    if (settings && settings.homeLayout) {
      try {
        let layout = [];
        if (typeof settings.homeLayout === 'string') {
          layout = JSON.parse(settings.homeLayout);
        } else {
          layout = settings.homeLayout;
        }
        title = layout[0]?.content?.title || '';
      } catch (e) {}
    }

    // Se a requisição aceita JSON, retorna as estatísticas
    if (req.accepts('json')) {
      return res.json({ stats });
    }

    // Caso contrário, retorna a página HTML
    res.send(`
      <html>
        <head>
          <title>Painel Admin</title>
          <style>body{font-family:sans-serif;padding:40px;}input{padding:8px;}</style>
        </head>
        <body>
          <h1>Painel Admin</h1>
          <form method="POST" action="/admin">
            <label>Título da Home:</label><br>
            <input name="title" value="${title}" style="width:300px"/><br><br>
            <button type="submit">Salvar</button>
          </form>
          <h2>Preview da Home</h2>
          <iframe src="/" width="100%" height="400" style="border:1px solid #ccc;"></iframe>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Erro ao carregar painel admin:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar eventos
router.get('/events', async (req, res) => {
  try {
    const events = await db('events')
      .select('*')
      .orderBy('created_at', 'desc');
    res.json(events);
  } catch (error) {
    console.error('Erro ao listar eventos:', error);
    res.status(500).json({ error: 'Erro ao listar eventos' });
  }
});

// Criar evento
router.post('/events', async (req, res) => {
  const trx = await db.transaction();
  
  try {
    const {
      title,
      description,
      date,
      location,
      banner,
      banner_home,
      banner_evento,
      status,
      registration_form,
      lots,
      has_payment,
      payment_gateway
    } = req.body;

    // Validar campos obrigatórios
    if (!title || !description || !date || !location) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios faltando',
        details: {
          title: !title ? 'Título é obrigatório' : null,
          description: !description ? 'Descrição é obrigatória' : null,
          date: !date ? 'Data é obrigatória' : null,
          location: !location ? 'Local é obrigatório' : null
        }
      });
    }

    // Validar lotes se houver pagamento
    if (has_payment && (!lots || !Array.isArray(lots) || lots.length === 0)) {
      return res.status(400).json({
        error: 'É necessário definir pelo menos um lote quando o pagamento está habilitado'
      });
    }

    // Validar gateway de pagamento se houver pagamento
    if (has_payment && !payment_gateway) {
      return res.status(400).json({
        error: 'É necessário definir um gateway de pagamento quando o pagamento está habilitado'
      });
    }

    // Gerar slug a partir do título
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    // Criar evento principal
    const [event] = await trx('events')
      .insert({
        title,
        description,
        date,
        location,
        banner: banner || null,
        banner_home: banner_home || null,
        banner_evento: banner_evento || null,
        status: status || 'active',
        slug,
        registration_form: registration_form ? JSON.stringify(registration_form) : null,
        has_payment: Boolean(has_payment),
        payment_gateway: has_payment ? payment_gateway : null,
        created_at: trx.fn.now(),
        updated_at: trx.fn.now()
      })
      .returning('*');

    // Inserir lotes se existirem
    if (lots && Array.isArray(lots) && lots.length > 0) {
      const lotsToInsert = lots.map(lot => {
        let startDate = lot.start_date;
        let endDate = lot.end_date;
        if (!startDate || startDate === "") startDate = null;
        if (!endDate || endDate === "") endDate = null;
        if (startDate && startDate.length === 10) {
          startDate += ' 00:00:00';
        }
        if (endDate && endDate.length === 10) {
          endDate += ' 23:59:59';
        }
        const price = parseFloat(lot.price) || 0;
        return {
          event_id: event.id,
          name: lot.name || '',
          price,
          quantity: parseInt(lot.quantity) || 0,
          start_date: startDate,
          end_date: endDate,
          status: lot.status || 'active',
          is_free: price === 0,
          created_at: trx.fn.now(),
          updated_at: trx.fn.now()
        };
      });

      await trx('lots').insert(lotsToInsert);
    }

    await trx.commit();

    // Buscar lotes criados
    const createdLots = await db('lots')
      .where('event_id', event.id)
      .orderBy('price', 'asc');

    res.status(201).json({
      ...event,
      lots: createdLots
    });
  } catch (error) {
    await trx.rollback();
    console.error('Erro ao criar evento:', error);
    
    // Verificar se é um erro de chave única (slug duplicado)
    if (error.code === '23505' && error.constraint === 'events_slug_unique') {
      return res.status(400).json({ 
        error: 'Já existe um evento com um título similar. Por favor, escolha outro título.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Erro ao criar evento',
      details: error.message 
    });
  }
});

// Atualizar evento
router.put('/events/:id', async (req, res) => {
  const trx = await db.transaction();
  
  try {
    const { id } = req.params;
    const {
      title,
      description,
      date,
      location,
      banner,
      banner_home,
      banner_evento,
      status,
      registration_form,
      lots
    } = req.body;

    // Gerar slug a partir do título
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    // Atualizar evento principal
    const [event] = await trx('events')
      .where('id', id)
      .update({
        title,
        description,
        date,
        location,
        banner,
        banner_home,
        banner_evento,
        status,
        slug,
        registration_form: registration_form ? JSON.stringify(registration_form) : null,
        updated_at: trx.fn.now()
      })
      .returning('*');

    if (!event) {
      await trx.rollback();
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    // Atualizar lotes
    if (lots && Array.isArray(lots)) {
      // Verificar lotes que serão removidos
      const currentLots = await trx('lots')
        .where('event_id', id)
        .select('id');

      const currentLotIds = currentLots.map(lot => lot.id);
      const newLotIds = lots.filter(lot => lot.id).map(lot => lot.id);
      const lotsToRemove = currentLotIds.filter(id => !newLotIds.includes(id));

      // Verificar se algum lote a ser removido tem inscrições
      for (const lotId of lotsToRemove) {
        const hasRegistrations = await trx('registrations')
          .where('lot_id', lotId)
          .first();

        if (hasRegistrations) {
          await trx.rollback();
          return res.status(400).json({ 
            error: `Não é possível remover o lote pois existem inscrições vinculadas a ele.` 
          });
        }
      }

      // Remover lotes antigos que não têm inscrições
      await trx('lots')
        .where('event_id', id)
        .whereNotIn('id', newLotIds)
        .del();

      // Atualizar ou inserir novos lotes
      for (const lot of lots) {
        if (lot.id) {
          // Atualizar lote existente
          await trx('lots')
            .where('id', lot.id)
            .update({
              name: lot.name,
              price: parseFloat(lot.price),
              quantity: parseInt(lot.quantity),
              start_date: lot.start_date,
              end_date: lot.end_date,
              status: lot.status || 'active',
              updated_at: trx.fn.now()
            });
        } else {
          // Inserir novo lote
          await trx('lots').insert({
            event_id: id,
            name: lot.name,
            price: parseFloat(lot.price),
            quantity: parseInt(lot.quantity),
            start_date: lot.start_date,
            end_date: lot.end_date,
            status: lot.status || 'active',
            created_at: trx.fn.now(),
            updated_at: trx.fn.now()
          });
        }
      }
    }

    await trx.commit();

    // Buscar evento atualizado com lotes
    const updatedEvent = await db('events')
      .where('id', id)
      .first();

    const updatedLots = await db('lots')
      .where('event_id', id)
      .orderBy('price', 'asc');

    res.json({
      ...updatedEvent,
      lots: updatedLots
    });

  } catch (error) {
    await trx.rollback();
    console.error('Erro ao atualizar evento:', error);
    res.status(500).json({ error: 'Erro ao atualizar evento: ' + error.message });
  }
});

// Deletar evento
router.delete('/events/:id', async (req, res) => {
  try {
    const deleted = await db('events')
      .where('id', req.params.id)
      .del();
    
    if (!deleted) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar evento:', error);
    res.status(500).json({ error: 'Erro ao deletar evento' });
  }
});

// Salvar edição das configurações
router.post('/', async (req, res) => {
  try {
    const settings = await db('settings').first();
    let layout = [];
    if (settings && settings.homeLayout) {
      try {
        layout = JSON.parse(settings.homeLayout);
      } catch (e) {}
    }
    // Atualiza o título do primeiro bloco (hero)
    if (layout[0]) {
      layout[0].content = layout[0].content || {};
      layout[0].content.title = req.body.title;
    } else {
      layout = [{ id: Date.now().toString(), type: 'hero', content: { title: req.body.title } }];
    }
    if (settings) {
      await db('settings')
        .update({ 
          homeLayout: JSON.stringify(layout), 
          updatedAt: new Date() 
        });
    } else {
      await db('settings')
        .insert({ 
          homeLayout: JSON.stringify(layout), 
          createdAt: new Date(), 
          updatedAt: new Date() 
        });
    }
    res.redirect('/admin');
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

// Eventos ativos
router.get('/events/active', async (req, res) => {
  try {
    const events = await db('events')
      .where('status', 'active')
      .orderBy('date', 'asc')
      .limit(5);
    res.json(events);
  } catch (error) {
    console.error('Erro ao buscar eventos ativos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar evento por ID
router.get('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const event = await db('events')
      .where('id', id)
      .first();

    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    // Buscar lotes do evento
    const lots = await db('lots')
      .where('event_id', id)
      .orderBy('price', 'asc');

    // Parse do registration_form se existir
    let registration_form = event.registration_form;
    if (registration_form && typeof registration_form === 'string') {
      try {
        registration_form = JSON.parse(registration_form);
      } catch (e) {
        registration_form = {
          cpf: false,
          age: false,
          gender: false,
          address: false,
          image_authorization: false,
          custom_fields: []
        };
      }
    }

    res.json({
      ...event,
      registration_form,
      banner: event.banner || 'https://via.placeholder.com/1200x400?text=Imagem+do+Evento',
      banner_home: event.banner_home || event.banner || 'https://via.placeholder.com/1200x400?text=Imagem+do+Evento',
      banner_evento: event.banner_evento || event.banner || 'https://via.placeholder.com/1200x400?text=Imagem+do+Evento',
      lots: lots || []
    });
  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    res.status(500).json({ error: 'Erro ao buscar evento' });
  }
});

// Listar todas as inscrições
router.get('/registrations', async (req, res) => {
  try {
    const registrations = await db('registrations')
      .select(
        'registrations.*',
        'users.name as user_name',
        'users.email as user_email',
        'events.title as event_title',
        'lots.name as lot_name' // <-- adicionar o nome do lote
      )
      .leftJoin('users', 'registrations.user_id', 'users.id')
      .leftJoin('events', 'registrations.event_id', 'events.id')
      .leftJoin('lots', 'registrations.lot_id', 'lots.id') // <-- join com lots
      .orderBy('registrations.created_at', 'desc');

    // Extrair nome/email do form_data se necessário
    const formatted = registrations.map(reg => {
      let name = reg.name;
      let email = reg.email;
      if ((!name || name === '-') || (!email || email === '-')) {
        try {
          const data = reg.form_data ? (typeof reg.form_data === 'string' ? JSON.parse(reg.form_data) : reg.form_data) : {};
          name = name || data.nome || data.name || '-';
          email = email || data.email || '-';
        } catch {
          // ignora
        }
      }
      return { ...reg, name, email };
    });

    res.json(formatted);
  } catch (error) {
    console.error('Erro ao listar inscrições:', error);
    res.status(500).json({ error: 'Erro ao listar inscrições' });
  }
});

// Listar todos os participantes únicos (mesmo sem login)
router.get('/participants', async (req, res) => {
  try {
    const participantsRaw = await db('registrations')
      .leftJoin('events', 'registrations.event_id', 'events.id')
      .select(
        'registrations.name',
        'registrations.email',
        'registrations.phone',
        db.raw('MIN(registrations.created_at) as created_at'),
        db.raw('COUNT(registrations.event_id) as events_count'),
        db.raw("GROUP_CONCAT(events.title, '; ') as events_titles"),
        db.raw('MAX(registrations.status) as last_status')
      )
      .groupBy('registrations.name', 'registrations.email', 'registrations.phone')
      .orderBy('created_at', 'desc');

    const participants = participantsRaw.map(p => ({
      ...p,
      name: p.name || '-',
      email: p.email || '-',
      phone: p.phone || '-',
      events_titles: p.events_titles ? p.events_titles.split(';').filter(Boolean).join(', ') : 'Sem Eventos',
      events_count: Number(p.events_count) || 0,
      last_status: p.last_status || '-'
    }));

    res.json(participants);
  } catch (error) {
    console.error('Erro ao listar participantes:', error);
    res.status(500).json({ error: 'Erro ao listar participantes' });
  }
});

// Rota de check-in
router.post('/checkin', async (req, res) => {
  const trx = await db.transaction();
  
  try {
    const { ticketCode, eventId } = req.body;

    if (!ticketCode || !eventId) {
      return res.status(400).json({ error: 'Código do ticket e ID do evento são obrigatórios' });
    }

    // Buscar o ticket e verificar se pertence ao evento correto
    const ticket = await trx('tickets')
      .join('registrations', 'tickets.inscricao_id', 'registrations.id')
      .where('tickets.ticket_code', ticketCode)
      .where('registrations.event_id', eventId)
      .select(
        'tickets.*',
        'registrations.name',
        'registrations.email',
        'registrations.event_id'
      )
      .first();

    if (!ticket) {
      await trx.rollback();
      return res.status(404).json({ error: 'Ticket não encontrado ou não pertence a este evento' });
    }

    if (ticket.status !== 'active') {
      await trx.rollback();
      return res.status(400).json({ error: 'Ticket já foi utilizado' });
    }

    // Registrar o check-in
    const now = new Date();
    await trx('tickets')
      .where('id', ticket.id)
      .update({
        checkin_time: now,
        status: 'used',
        updated_at: now
      });

    // Registrar no log de check-in
    await trx('checkin_logs').insert({
      ticket_id: ticket.id,
      event_id: eventId,
      checkin_time: now,
      created_at: now
    });

    await trx.commit();

    res.json({
      message: 'Check-in realizado com sucesso',
      ticket: {
        code: ticket.ticket_code,
        name: ticket.name,
        email: ticket.email,
        checkin_time: now
      }
    });

  } catch (error) {
    await trx.rollback();
    console.error('Erro ao processar check-in:', error);
    res.status(500).json({ error: 'Erro ao processar check-in' });
  }
});

// Rota para obter estatísticas de check-in
router.get('/checkin/stats', async (req, res) => {
  try {
    const total = await db('tickets').count('* as count').first();
    const checked = await db('tickets')
      .where('status', 'used')
      .count('* as count')
      .first();

    res.json({
      total: parseInt(total.count),
      checked: parseInt(checked.count)
    });

  } catch (error) {
    res.status(400).json({
      error: error.message || 'Erro ao buscar estatísticas'
    });
  }
});

// Rota para buscar detalhes do ticket
router.get('/tickets/:code', async (req, res) => {
  try {
    const ticket = await db('tickets')
      .join('registrations', 'tickets.inscricao_id', 'registrations.id')
      .join('events', 'registrations.event_id', 'events.id')
      .join('lots', 'registrations.lot_id', 'lots.id')
      .join('users', 'registrations.user_id', 'users.id')
      .where('tickets.ticket_code', req.params.code)
      .select(
        'tickets.*',
        'registrations.name',
        'registrations.email',
        'events.title as event_title',
        'events.date as event_date',
        'events.location as event_location',
        'lots.name as lot_name',
        'users.id as user_id',
        'users.name as user_name',
        'users.email as user_email'
      )
      .first();

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    // Formatar os dados para o frontend
    const response = {
      ticket_code: ticket.ticket_code,
      name: ticket.name,
      email: ticket.email,
      event_title: ticket.event_title,
      event_date: ticket.event_date,
      event_location: ticket.event_location,
      lot_name: ticket.lot_name,
      status: ticket.status === 'active' ? 'active' : 'used',
      checkin_time: ticket.checkin_time
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar detalhes do ticket:', error);
    res.status(500).json({ error: 'Erro ao buscar detalhes do ticket' });
  }
});

// Rota para buscar estatísticas do evento
router.get('/events/:eventId/stats', async (req, res) => {
  try {
    const eventId = req.params.eventId;

    // Buscar total de inscrições
    const totalResultArr = await db('registrations')
      .where('event_id', eventId)
      .count('id as total');
    const totalResult = Array.isArray(totalResultArr) ? totalResultArr[0] : (totalResultArr || { total: 0 });

    // Buscar total de check-ins
    const checkedResultArr = await db('tickets')
      .join('registrations', 'tickets.inscricao_id', 'registrations.id')
      .where('registrations.event_id', eventId)
      .whereNotNull('tickets.checkin_time')
      .count('tickets.id as checked');
    const checkedResult = Array.isArray(checkedResultArr) ? checkedResultArr[0] : (checkedResultArr || { checked: 0 });

    // Buscar check-ins na última hora
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const lastHourResultArr = await db('tickets')
      .join('registrations', 'tickets.inscricao_id', 'registrations.id')
      .where('registrations.event_id', eventId)
      .where('tickets.checkin_time', '>=', oneHourAgo)
      .count('tickets.id as count');
    const lastHourResult = Array.isArray(lastHourResultArr) ? lastHourResultArr[0] : (lastHourResultArr || { count: 0 });

    // Calcular taxa média de check-in
    const firstCheckin = await db('tickets')
      .join('registrations', 'tickets.inscricao_id', 'registrations.id')
      .where('registrations.event_id', eventId)
      .whereNotNull('tickets.checkin_time')
      .orderBy('tickets.checkin_time', 'asc')
      .select('tickets.checkin_time')
      .first();

    let checkInRate = 0;
    if (firstCheckin && firstCheckin.checkin_time) {
      const hoursSinceStart = (Date.now() - new Date(firstCheckin.checkin_time).getTime()) / (1000 * 60 * 60);
      checkInRate = hoursSinceStart > 0 ? Math.round((checkedResult?.checked || 0) / hoursSinceStart) : 0;
    }

    res.json({
      total: parseInt(totalResult?.total || 0),
      checked: parseInt(checkedResult?.checked || 0),
      lastHourCheckins: parseInt(lastHourResult?.count || 0),
      checkInRate
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas do evento' });
  }
});

// Estatísticas gerais
router.get('/stats', async (req, res) => {
  try {
    // Total de eventos
    const [{ totalEvents }] = await db('events').count('* as totalEvents');
    
    // Eventos ativos
    const [{ activeEvents }] = await db('events')
      .where('status', 'active')
      .count('* as activeEvents');
    
    // Total de participantes
    const [{ totalParticipants }] = await db('registrations')
      .countDistinct('user_id as totalParticipants');
    
    // Receita total
    const [{ totalRevenue }] = await db('registrations')
      .join('lots', 'registrations.lot_id', 'lots.id')
      .where('registrations.payment_status', 'paid')
      .sum('lots.price as totalRevenue');

    res.json({
      totalEvents: parseInt(totalEvents),
      activeEvents: parseInt(activeEvents),
      totalParticipants: parseInt(totalParticipants),
      totalRevenue: parseFloat(totalRevenue || 0)
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Inscrições recentes
router.get('/registrations/recent', async (req, res) => {
  try {
    const registrations = await db('registrations')
      .join('events', 'registrations.event_id', 'events.id')
      .join('lots', 'registrations.lot_id', 'lots.id')
      .leftJoin('users', 'registrations.user_id', 'users.id')
      .select(
        'registrations.id',
        'registrations.name as reg_name',
        'registrations.email as reg_email',
        'registrations.form_data',
        'users.name as user_name',
        'users.email as user_email',
        'events.title as event_title',
        'lots.name as lot_name',
        'registrations.payment_status as status',
        'registrations.created_at'
      )
      .orderBy('registrations.created_at', 'desc')
      .limit(5);

    // Garantir nome/email mesmo sem usuário
    const formatted = registrations.map(reg => {
      let name = reg.user_name || reg.reg_name || '-';
      let email = reg.user_email || reg.reg_email || '-';
      if ((!name || name === '-') || (!email || email === '-')) {
        try {
          const data = reg.form_data ? (typeof reg.form_data === 'string' ? JSON.parse(reg.form_data) : reg.form_data) : {};
          name = name || data.nome || data.name || '-';
          email = email || data.email || '-';
        } catch {
          // ignora
        }
      }
      return {
        id: reg.id,
        name,
        email,
        event_title: reg.event_title,
        lot_name: reg.lot_name,
        status: reg.status,
        created_at: reg.created_at
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error('Erro ao buscar inscrições recentes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar todas as contas criadas (usuários)
router.get('/users', async (req, res) => {
  try {
    const users = await db('users')
      .select('id', 'name', 'username', 'email', 'birthdate', 'gender', 'created_at')
      .orderBy('created_at', 'desc');
    res.json(users);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
});

module.exports = router; 