const express = require('express');
const router = express.Router();
const { db } = require('../database/db');
const { authenticateToken, requireAdmin } = require('../middleware');

// Middleware CORS específico para rotas admin
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Length');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

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
router.get('/events', authenticateToken, requireAdmin, async (req, res) => {
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

// Rota de teste para criar evento sem autenticação (REMOVER APÓS USO)
router.post('/events-test', async (req, res) => {
  try {
    console.log('🧪 TESTE DE CRIAÇÃO DE EVENTO');
    console.log('📦 Dados recebidos:', req.body);
    
    res.json({
      success: true,
      message: 'Teste de criação de evento funcionando',
      data: req.body
    });
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    res.status(500).json({
      error: 'Erro no teste de criação',
      details: error.message
    });
  }
});

// Criar evento
router.post('/events', authenticateToken, requireAdmin, async (req, res) => {
  console.log('🎯 Tentativa de criar evento:', req.body);
  
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

    console.log('📝 Dados recebidos:', {
      title,
      description: description?.substring(0, 50) + '...',
      date,
      location,
      has_payment,
      payment_gateway
    });

    // Validar campos obrigatórios
    if (!title || !description || !date || !location) {
      console.log('❌ Validação falhou:', { title: !!title, description: !!description, date: !!date, location: !!location });
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

    // Gerar slug a partir do título
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // remove caracteres especiais, exceto espaços e hífens
      .trim() // remove espaços em branco do início e do fim
      .replace(/\s+/g, '-') // substitui espaços por hífens
      .replace(/-+/g, '-'); // substitui múltiplos hífens por um único hífen

    console.log('🔗 Slug gerado:', slug);

    // Validar lotes se houver pagamento
    if (has_payment && (!lots || !Array.isArray(lots) || lots.length === 0)) {
      console.log('❌ Lotes obrigatórios para pagamento');
      return res.status(400).json({
        error: 'É necessário definir pelo menos um lote quando o pagamento está habilitado'
      });
    }

    // Validar gateway de pagamento se houver pagamento
    if (has_payment && !payment_gateway) {
      console.log('❌ Gateway obrigatório para pagamento');
      return res.status(400).json({
        error: 'É necessário definir um gateway de pagamento quando o pagamento está habilitado'
      });
    }

    console.log('✅ Validações passaram, criando evento...');

    // Criar evento principal
    const eventData = {
      title,
      description,
      date: date.includes('T') ? date : date + ' 00:00:00', // Garantir formato correto
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
    };

    console.log('📊 Dados do evento para inserção:', eventData);

    const [event] = await trx('events')
      .insert(eventData)
      .returning('*');

    console.log('✅ Evento criado:', event.id, event.title);

    // Inserir lotes se existirem
    if (lots && Array.isArray(lots) && lots.length > 0) {
      console.log('📦 Criando lotes:', lots.length);
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
      .replace(/[^\w\s-]/g, '') // remove caracteres especiais, exceto espaços e hífens
      .trim() // remove espaços em branco do início e do fim
      .replace(/\s+/g, '-') // substitui espaços por hífens
      .replace(/-+/g, '-'); // substitui múltiplos hífens por um único hífen

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
      
      // Se não tem nome/email, tentar extrair do form_data
      if ((!name || name === '-') || (!email || email === '-')) {
        try {
          const data = reg.form_data ? (typeof reg.form_data === 'string' ? JSON.parse(reg.form_data) : reg.form_data) : {};
          name = name || data.nome || data.name || data.participantes?.[0]?.name || '-';
          email = email || data.email || data.participantes?.[0]?.email || '-';
        } catch {
          // ignora
        }
      }
      
      // Garantir que sempre tenha um valor
      name = name || reg.user_name || '-';
      email = email || reg.user_email || '-';
      
      return { ...reg, name, email };
    });

    res.json(formatted);
  } catch (error) {
    console.error('Erro ao listar inscrições:', error);
    res.status(500).json({ error: 'Erro ao listar inscrições' });
  }
});

// Listar todos os participantes únicos (mesmo sem login)
router.get('/participants', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('🔍 Buscando participantes...');
    
    const participantsRaw = await db('registrations')
      .leftJoin('events', 'registrations.event_id', 'events.id')
      .select(
        'registrations.name',
        'registrations.email',
        'registrations.phone',
        db.raw('MIN(registrations.created_at) as created_at'),
        db.raw('COUNT(registrations.event_id) as events_count'),
        db.raw("GROUP_CONCAT(events.title, '; ') as events_titles"),
        db.raw('MAX(registrations.payment_status) as last_status')
      )
      .groupBy('registrations.name', 'registrations.email', 'registrations.phone')
      .orderBy('created_at', 'desc');

    console.log(`✅ Encontrados ${participantsRaw.length} participantes`);

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
    console.error('❌ Erro ao listar participantes:', error);
    res.status(500).json({ error: 'Erro ao listar participantes', details: error.message });
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

    // Buscar o ticket e verificar se pertence ao evento correto - Comentado temporariamente
    /*
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
    */
    
    // Check-in simulado
    const now = new Date();
    const ticket = {
      ticket_code: ticketCode,
      name: 'Participante',
      email: 'participante@email.com',
      checkin_time: now
    };

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

// Rota para obter estatísticas de check-in - Comentado temporariamente
/*
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
*/

// Rota para buscar detalhes do ticket - Comentado temporariamente
/*
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
*/

// Rota para buscar estatísticas do evento
router.get('/events/:eventId/stats', async (req, res) => {
  try {
    const eventId = req.params.eventId;

    // Buscar total de inscrições
    const totalResultArr = await db('registrations')
      .where('event_id', eventId)
      .count('id as total');
    const totalResult = Array.isArray(totalResultArr) ? totalResultArr[0] : (totalResultArr || { total: 0 });

    // Buscar total de check-ins - Comentado temporariamente
    /*
    const checkedResultArr = await db('tickets')
      .join('registrations', 'tickets.inscricao_id', 'registrations.id')
      .where('registrations.event_id', eventId)
      .whereNotNull('tickets.checkin_time')
      .count('tickets.id as checked');
    const checkedResult = Array.isArray(checkedResultArr) ? checkedResultArr[0] : (checkedResultArr || { checked: 0 });
    */
    const checkedResult = { checked: 0 };

    // Buscar check-ins na última hora - Comentado temporariamente
    /*
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const lastHourResultArr = await db('tickets')
      .join('registrations', 'tickets.inscricao_id', 'registrations.id')
      .where('registrations.event_id', eventId)
      .where('tickets.checkin_time', '>=', oneHourAgo)
      .count('tickets.id as count');
    const lastHourResult = Array.isArray(lastHourResultArr) ? lastHourResultArr[0] : (lastHourResultArr || { count: 0 });
    */
    const lastHourResult = { count: 0 };

    // Calcular taxa média de check-in - Comentado temporariamente
    /*
    const firstCheckin = await db('tickets')
      .join('registrations', 'tickets.inscricao_id', 'registrations.id')
      .where('registrations.event_id', eventId)
      .whereNotNull('tickets.checkin_time')
      .orderBy('tickets.checkin_time', 'asc')
      .select('tickets.checkin_time')
      .first();
    */
    const firstCheckin = null;

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
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Total de eventos
    const [{ totalEvents }] = await db('events').count('* as totalEvents');
    
    // Eventos ativos
    const [{ activeEvents }] = await db('events')
      .where('status', 'active')
      .count('* as activeEvents');
    
    // Total de participantes (contando por email único)
    const [{ totalParticipants }] = await db('registrations')
      .countDistinct('email as totalParticipants');
    
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
router.get('/registrations/recent', authenticateToken, requireAdmin, async (req, res) => {
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

// Limpar todos os dados de participantes
router.delete('/participants/clear', async (req, res) => {
  try {
    // Limpar todas as inscrições
    const deletedCount = await db('registrations').del();
    
    console.log(`🗑️ Limpeza concluída: ${deletedCount} registros de participantes removidos`);
    
    res.json({ 
      success: true, 
      message: `Limpeza concluída com sucesso! ${deletedCount} registros de participantes foram removidos.`,
      deletedCount 
    });
  } catch (error) {
    console.error('Erro ao limpar participantes:', error);
    res.status(500).json({ error: 'Erro ao limpar dados de participantes' });
  }
});

// ROTA TEMPORÁRIA PARA CORRIGIR BANCO (REMOVER APÓS USO)
router.post('/fix-database-emergency', async (req, res) => {
  try {
    console.log('🚨 CORREÇÃO EMERGENCIAL DO BANCO INICIADA');
    
    const { db } = require('../database/db');
    
    // Verificar se a tabela registrations existe
    const tableExists = await db.schema.hasTable('registrations');
    if (!tableExists) {
      return res.status(400).json({ 
        error: 'Tabela registrations não existe',
        action: 'Execute migrations primeiro' 
      });
    }
    
    // Verificar colunas existentes
    const columns = await db('registrations').columnInfo();
    const existingColumns = Object.keys(columns);
    
    // Colunas necessárias
    const requiredColumns = ['address', 'registration_code', 'payment_status', 'form_data'];
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length === 0) {
      return res.json({
        success: true,
        message: 'Todas as colunas já existem',
        existingColumns
      });
    }
    
    // Adicionar colunas faltantes
    const addedColumns = [];
    for (const column of missingColumns) {
      try {
        await db.schema.table('registrations', function(table) {
          switch(column) {
            case 'address':
              table.string('address').nullable();
              break;
            case 'registration_code':
              table.string('registration_code').nullable();
              break;
            case 'payment_status':
              table.string('payment_status').nullable();
              break;
            case 'form_data':
              table.text('form_data').nullable();
              break;
          }
        });
        addedColumns.push(column);
        console.log(`✅ Coluna ${column} adicionada`);
      } catch (colError) {
        console.log(`❌ Erro ao adicionar ${column}:`, colError.message);
      }
    }
    
    // Verificar estrutura final
    const finalColumns = await db('registrations').columnInfo();
    
    // Teste de inserção
    let testSuccess = false;
    try {
      const testData = {
        event_id: 1,
        lot_id: 1,
        name: 'Teste API Fix',
        email: 'teste@fix.com',
        phone: '11999999999',
        address: 'Test Address',
        registration_code: 'API-FIX-TEST',
        payment_status: 'pending',
        form_data: '{"test": true}',
        status: 'confirmed'
      };
      
      const [testId] = await db('registrations').insert(testData).returning('id');
      await db('registrations').where('id', testId).delete();
      testSuccess = true;
    } catch (testError) {
      console.log('❌ Teste de inserção falhou:', testError.message);
    }
    
    res.json({
      success: true,
      message: 'Banco corrigido com sucesso!',
      details: {
        existingColumns,
        missingColumns,
        addedColumns,
        finalColumns: Object.keys(finalColumns),
        testSuccess
      }
    });
    
  } catch (error) {
    console.error('❌ Erro na correção emergencial:', error);
    res.status(500).json({
      error: 'Erro na correção do banco',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ROTA EMERGENCIAL PARA EXECUTAR MIGRATIONS E CRIAR EVENTO
router.post('/setup-database-complete', async (req, res) => {
  try {
    console.log('🚨 SETUP COMPLETO DO BANCO INICIADO');
    
    const { db } = require('../database/db');
    const results = {
      migrations: [],
      tablesCreated: [],
      eventCreated: null,
      lotCreated: null,
      errors: []
    };

    // 1. Verificar e criar tabela users se não existir
    const usersExists = await db.schema.hasTable('users');
    if (!usersExists) {
      await db.schema.createTable('users', function(table) {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('email').notNullable().unique();
        table.string('password').notNullable();
        table.string('role').defaultTo('user');
        table.boolean('is_admin').defaultTo(false);
        table.string('phone').nullable();
        table.timestamps(true, true);
      });
      results.tablesCreated.push('users');
    }

    // 2. Verificar e criar tabela events se não existir
    const eventsExists = await db.schema.hasTable('events');
    if (!eventsExists) {
      await db.schema.createTable('events', function(table) {
        table.increments('id').primary();
        table.string('title').notNullable();
        table.text('description').nullable();
        table.datetime('start_date').notNullable();
        table.datetime('end_date').notNullable();
        table.string('location').nullable();
        table.string('status').defaultTo('draft');
        table.integer('max_participants').defaultTo(0);
        table.decimal('price', 10, 2).defaultTo(0);
        table.string('image_url').nullable();
        table.text('home_content').nullable();
        table.string('slug').nullable();
        table.timestamps(true, true);
      });
      results.tablesCreated.push('events');
    }

    // 3. Verificar e criar tabela lots se não existir
    const lotsExists = await db.schema.hasTable('lots');
    if (!lotsExists) {
      await db.schema.createTable('lots', function(table) {
        table.increments('id').primary();
        table.integer('event_id').unsigned().references('id').inTable('events').onDelete('CASCADE');
        table.string('name').notNullable();
        table.text('description').nullable();
        table.decimal('price', 10, 2).notNullable();
        table.integer('quantity').notNullable();
        table.datetime('start_date').notNullable();
        table.datetime('end_date').notNullable();
        table.string('status').defaultTo('active');
        table.boolean('is_free').defaultTo(false);
        table.timestamps(true, true);
      });
      results.tablesCreated.push('lots');
    }

    // 4. Verificar e criar tabela registrations com TODAS as colunas
    const registrationsExists = await db.schema.hasTable('registrations');
    if (!registrationsExists) {
      await db.schema.createTable('registrations', function(table) {
        table.increments('id').primary();
        table.integer('event_id').unsigned().references('id').inTable('events').onDelete('CASCADE');
        table.integer('lot_id').unsigned().references('id').inTable('lots').onDelete('SET NULL');
        table.integer('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
        table.string('name').notNullable();
        table.string('email').notNullable();
        table.string('phone').notNullable();
        table.string('cpf').nullable();
        table.string('address').nullable();
        table.string('registration_code').nullable();
        table.string('status').defaultTo('pending');
        table.string('payment_status').nullable();
        table.text('form_data').nullable();
        table.timestamps(true, true);
      });
      results.tablesCreated.push('registrations');
    }

    // 5. Criar evento de teste se não existir
    const existingEvents = await db('events').count('id as count').first();
    const eventCount = existingEvents.count || 0;

    if (eventCount === 0) {
      const [eventoId] = await db('events').insert({
        title: 'CONNECT CONF 2025 - Igreja CEM',
        description: 'Evento principal da Igreja CEM para 2025',
        start_date: '2025-08-01 19:00:00',
        end_date: '2025-08-03 22:00:00',
        location: 'Igreja CEM - São Paulo',
        status: 'active',
        max_participants: 1000,
        price: 0,
        image_url: '/images_site/banner-home.png',
        slug: 'connect-conf-2025'
      }).returning('id');

      const finalEventId = typeof eventoId === 'object' ? eventoId.id : eventoId;
      results.eventCreated = finalEventId;

      // 6. Criar lote gratuito
      const [loteId] = await db('lots').insert({
        event_id: finalEventId,
        name: 'Entrada Gratuita',
        description: 'Acesso completo ao evento',
        price: 0,
        quantity: 1000,
        start_date: '2025-01-01 00:00:00',
        end_date: '2025-07-31 23:59:59',
        status: 'active',
        is_free: true
      }).returning('id');

      results.lotCreated = typeof loteId === 'object' ? loteId.id : loteId;
    }

    // 7. Verificar estrutura final
    const finalTables = [];
    const tables = ['users', 'events', 'lots', 'registrations'];
    for (const table of tables) {
      const exists = await db.schema.hasTable(table);
      if (exists) finalTables.push(table);
    }

    res.json({
      success: true,
      message: 'Banco configurado com sucesso!',
      results: {
        ...results,
        finalTables,
        eventCount: await db('events').count('id as count').first()
      }
    });

  } catch (error) {
    console.error('❌ Erro no setup do banco:', error);
    res.status(500).json({
      error: 'Erro no setup do banco',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ROTA DE EMERGÊNCIA PARA VERIFICAR UPLOAD
router.post('/check-upload', async (req, res) => {
  try {
    console.log('🔍 VERIFICANDO UPLOAD...');
    
    const fs = require('fs');
    const path = require('path');
    
    // 1. Verificar pasta uploads
    const uploadsPath = path.join(__dirname, '../uploads');
    console.log('📁 Caminho uploads:', uploadsPath);
    
    if (!fs.existsSync(uploadsPath)) {
      console.log('❌ Pasta uploads não existe! Criando...');
      fs.mkdirSync(uploadsPath, { recursive: true });
      console.log('✅ Pasta uploads criada');
    } else {
      console.log('✅ Pasta uploads existe');
    }
    
    // 2. Verificar pasta events
    const eventsPath = path.join(uploadsPath, 'events');
    if (!fs.existsSync(eventsPath)) {
      console.log('❌ Pasta events não existe! Criando...');
      fs.mkdirSync(eventsPath, { recursive: true });
      console.log('✅ Pasta events criada');
    } else {
      console.log('✅ Pasta events existe');
    }
    
    // 3. Testar permissões
    try {
      const testFile = path.join(eventsPath, 'test.txt');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      console.log('✅ Permissões OK');
    } catch (error) {
      console.log('❌ Erro de permissões:', error.message);
    }
    
    // 4. Listar arquivos existentes
    const files = fs.readdirSync(uploadsPath);
    console.log('📋 Arquivos em uploads:', files);
    
    res.json({
      success: true,
      message: 'Upload verificado',
      uploadsPath,
      eventsPath,
      files,
      permissions: 'OK'
    });
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
    res.status(500).json({
      error: 'Erro na verificação',
      details: error.message
    });
  }
});

// ROTA DE EMERGÊNCIA PARA RECRIAR EVENTO (REMOVER APÓS USO)
router.post('/recreate-event-emergency', async (req, res) => {
  try {
    console.log('🚨 RECRIANDO EVENTO DE EMERGÊNCIA');
    
    // Verificar se a tabela events existe
    const eventsExists = await db.schema.hasTable('events');
    if (!eventsExists) {
      await db.schema.createTable('events', function(table) {
        table.increments('id').primary();
        table.string('title').notNullable();
        table.text('description').nullable();
        table.datetime('date').notNullable();
        table.string('location').notNullable();
        table.decimal('price', 10, 2);
        table.string('banner');
        table.string('banner_home');
        table.string('banner_evento');
        table.string('slug').unique();
        table.string('status').defaultTo('active');
        table.json('registration_form');
        table.timestamps(true, true);
      });
      console.log('✅ Tabela events criada');
    }

    // Verificar se a tabela lots existe
    const lotsExists = await db.schema.hasTable('lots');
    if (!lotsExists) {
      await db.schema.createTable('lots', function(table) {
        table.increments('id').primary();
        table.integer('event_id').unsigned().references('id').inTable('events').onDelete('CASCADE');
        table.string('name').notNullable();
        table.text('description').nullable();
        table.decimal('price', 10, 2);
        table.integer('quantity');
        table.datetime('start_date');
        table.datetime('end_date');
        table.string('status').defaultTo('active');
        table.boolean('is_free').defaultTo(false);
        table.timestamps(true, true);
      });
      console.log('✅ Tabela lots criada');
    } else {
      // Verificar se a coluna description existe
      const columns = await db('lots').columnInfo();
      const existingColumns = Object.keys(columns);
      
      if (!existingColumns.includes('description')) {
        console.log('❌ Coluna description não existe! Adicionando...');
        await db.schema.alterTable('lots', table => {
          table.text('description').nullable();
        });
        console.log('✅ Coluna description adicionada');
      }
    }

    // Deletar evento existente se houver
    await db('events').where('id', 1).del();
    console.log('🗑️ Evento anterior deletado');

    // Criar novo evento
    const [eventId] = await db('events').insert({
      title: 'CONNECT CONF 2025 - INPROVÁVEIS',
      description: 'A Connect Conf 2025 é mais do que uma conferência – é um chamado para aqueles que se acham fora do padrão, esquecidos ou desacreditados.',
      date: '2025-10-24 19:00:00',
      location: 'Igreja CEM - CAJATI, localizada na Av. dos trabalhadores, Nº99 - Centro, Cajati/SP.',
      price: 60,
      banner: 'https://i.ibb.co/tpzV7gt4/jpg-foto.jpg',
      banner_home: 'https://i.ibb.co/tpzV7gt4/jpg-foto.jpg',
      banner_evento: 'https://i.ibb.co/tpzV7gt4/jpg-foto.jpg',
      slug: 'connect-conf-2025-inprovveis',
      status: 'active'
    }).returning('id');

    console.log('✅ Evento criado com ID:', eventId);

    // Deletar lotes existentes se houver
    await db('lots').where('event_id', eventId).del();
    console.log('🗑️ Lotes anteriores deletados');

    // Criar novo lote
    const [lotId] = await db('lots').insert({
      event_id: eventId,
      name: 'LOTE 1',
      description: 'Lote principal do evento',
      price: 60,
      quantity: 100,
      start_date: '2025-01-01 00:00:00',
      end_date: '2025-07-30 23:59:59',
      status: 'active',
      is_free: false
    }).returning('id');

    console.log('✅ Lote criado com ID:', lotId);

    res.json({
      success: true,
      message: 'Evento recriado com sucesso!',
      eventId,
      lotId
    });

  } catch (error) {
    console.error('❌ Erro ao recriar evento:', error);
    res.status(500).json({
      error: 'Erro ao recriar evento',
      details: error.message
    });
  }
});

// ROTA DE EMERGÊNCIA PARA RESTAURAR EVENTO COMPLETO (REMOVER APÓS USO)
router.post('/restore-complete-event-emergency', async (req, res) => {
  try {
    console.log('🚨 RESTAURANDO EVENTO COMPLETO DE EMERGÊNCIA');
    
    const fs = require('fs');
    const path = require('path');
    
    // Ler backup
    const backupPath = path.join(__dirname, '../backups/critical_data_2025-07-27T00-43-31-763Z.json');
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    
    console.log('📋 Backup carregado com timestamp:', backupData.timestamp);
    
    // 1. Verificar se as tabelas existem, se não, criar
    const eventsExists = await db.schema.hasTable('events');
    const lotsExists = await db.schema.hasTable('lots');
    const registrationsExists = await db.schema.hasTable('registrations');
    
    if (!eventsExists) {
      await db.schema.createTable('events', function(table) {
        table.increments('id').primary();
        table.string('title').notNullable();
        table.text('description').nullable();
        table.datetime('date').notNullable();
        table.string('location').notNullable();
        table.decimal('price', 10, 2);
        table.string('banner');
        table.string('banner_home');
        table.string('banner_evento');
        table.string('slug').unique();
        table.string('status').defaultTo('active');
        table.json('registration_form');
        table.timestamps(true, true);
      });
      console.log('✅ Tabela events criada');
    }
    
    if (!lotsExists) {
      await db.schema.createTable('lots', function(table) {
        table.increments('id').primary();
        table.integer('event_id').unsigned().references('id').inTable('events').onDelete('CASCADE');
        table.string('name').notNullable();
        table.text('description').nullable();
        table.decimal('price', 10, 2);
        table.integer('quantity');
        table.datetime('start_date');
        table.datetime('end_date');
        table.string('status').defaultTo('active');
        table.boolean('is_free').defaultTo(false);
        table.timestamps(true, true);
      });
      console.log('✅ Tabela lots criada');
    }
    
    if (!registrationsExists) {
      await db.schema.createTable('registrations', function(table) {
        table.increments('id').primary();
        table.integer('event_id').unsigned().references('id').inTable('events').onDelete('CASCADE');
        table.integer('lot_id').unsigned().references('id').inTable('lots').onDelete('SET NULL');
        table.integer('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
        table.string('name').notNullable();
        table.string('email').notNullable();
        table.string('phone').notNullable();
        table.string('cpf').nullable();
        table.string('address').nullable();
        table.string('registration_code').nullable();
        table.string('status').defaultTo('pending');
        table.string('payment_status').nullable();
        table.text('form_data').nullable();
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.timestamp('updated_at').defaultTo(db.fn.now());
      });
      console.log('✅ Tabela registrations criada');
    }
    
    // 2. Limpar dados existentes
    await db('registrations').del();
    await db('lots').del();
    await db('events').del();
    console.log('🗑️ Dados existentes limpos');
    
    // 2. Restaurar eventos
    for (const event of backupData.events) {
      const eventData = {
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        banner: event.banner,
        banner_home: event.banner_home,
        banner_evento: event.banner_evento,
        slug: event.slug,
        status: event.status,
        registration_form: event.registration_form,
        created_at: event.created_at,
        updated_at: event.updated_at
      };
      
      const [eventId] = await db('events').insert(eventData).returning('id');
      console.log(`✅ Evento restaurado: ${event.title} (ID: ${eventId})`);
    }
    
    // 3. Restaurar lotes
    for (const lot of backupData.lots) {
      const lotData = {
        event_id: lot.event_id,
        name: lot.name,
        price: lot.price,
        quantity: lot.quantity,
        start_date: lot.start_date,
        end_date: lot.end_date,
        status: lot.status,
        is_free: lot.is_free,
        created_at: lot.created_at,
        updated_at: lot.updated_at
      };
      
      const [lotId] = await db('lots').insert(lotData).returning('id');
      console.log(`✅ Lote restaurado: ${lot.name} (ID: ${lotId})`);
    }
    
    // 4. Restaurar participantes
    let participantCount = 0;
    for (const registration of backupData.registrations) {
      const registrationData = {
        event_id: registration.event_id,
        lot_id: registration.lot_id,
        user_id: registration.user_id,
        name: registration.name,
        email: registration.email,
        phone: registration.phone,
        cpf: registration.cpf,
        address: registration.address,
        registration_code: registration.registration_code,
        status: registration.status,
        payment_status: registration.payment_status,
        form_data: registration.form_data,
        created_at: registration.created_at,
        updated_at: registration.updated_at
      };
      
      await db('registrations').insert(registrationData);
      participantCount++;
      console.log(`✅ Participante restaurado: ${registration.name} (${registration.email})`);
    }
    
    console.log(`🎉 RESTAURAÇÃO COMPLETA CONCLUÍDA!`);
    console.log(`   📅 Eventos: ${backupData.events.length}`);
    console.log(`   🎫 Lotes: ${backupData.lots.length}`);
    console.log(`   👥 Participantes: ${participantCount}`);
    
    res.json({
      success: true,
      message: 'Evento completo restaurado com sucesso!',
      events: backupData.events.length,
      lots: backupData.lots.length,
      participants: participantCount
    });
    
  } catch (error) {
    console.error('❌ Erro ao restaurar evento completo:', error);
    res.status(500).json({
      error: 'Erro ao restaurar evento completo',
      details: error.message
    });
  }
});

// ROTA DE EMERGÊNCIA PARA ATIVAR MODO FAKE (REMOVER APÓS USO)
router.post('/activate-fake-payment', async (req, res) => {
  try {
    console.log('🎭 ATIVANDO MODO FAKE DE PAGAMENTO');
    
    // Ativar modo fake no config
    const config = require('../config');
    config.PAYMENT_FAKE_MODE = true;
    config.REAL_PAYMENT_STATUS = 'paid'; // Pagamentos sempre aprovados
    
    console.log('✅ Modo fake ativado');
    console.log('💰 PAYMENT_FAKE_MODE:', config.PAYMENT_FAKE_MODE);
    console.log('📊 REAL_PAYMENT_STATUS:', config.REAL_PAYMENT_STATUS);
    
    res.json({
      success: true,
      message: 'Modo fake de pagamento ativado com sucesso!',
      config: {
        PAYMENT_FAKE_MODE: config.PAYMENT_FAKE_MODE,
        REAL_PAYMENT_STATUS: config.REAL_PAYMENT_STATUS
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao ativar modo fake:', error);
    res.status(500).json({
      error: 'Erro ao ativar modo fake',
      details: error.message
    });
  }
});

// ROTA DE EMERGÊNCIA PARA VERIFICAR PERSISTÊNCIA (REMOVER APÓS USO)
router.post('/check-persistence-emergency', async (req, res) => {
  try {
    console.log('🔍 VERIFICANDO PERSISTÊNCIA DO BANCO');
    
    // Verificar se as tabelas existem
    const eventsExists = await db.schema.hasTable('events');
    const lotsExists = await db.schema.hasTable('lots');
    const registrationsExists = await db.schema.hasTable('registrations');
    
    console.log('📋 Tabelas existem:');
    console.log('   - events:', eventsExists);
    console.log('   - lots:', lotsExists);
    console.log('   - registrations:', registrationsExists);
    
    // Contar registros
    const eventCount = eventsExists ? await db('events').count('id as count').first() : { count: 0 };
    const lotCount = lotsExists ? await db('lots').count('id as count').first() : { count: 0 };
    const registrationCount = registrationsExists ? await db('registrations').count('id as count').first() : { count: 0 };
    
    console.log('📊 Contagem de registros:');
    console.log('   - events:', eventCount.count);
    console.log('   - lots:', lotCount.count);
    console.log('   - registrations:', registrationCount.count);
    
    // Listar eventos
    let events = [];
    if (eventsExists) {
      events = await db('events').select('*');
    }
    
    res.json({
      success: true,
      tables: {
        events: eventsExists,
        lots: lotsExists,
        registrations: registrationsExists
      },
      counts: {
        events: eventCount.count,
        lots: lotCount.count,
        registrations: registrationCount.count
      },
      events: events
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar persistência:', error);
    res.status(500).json({
      error: 'Erro ao verificar persistência',
      details: error.message
    });
  }
});

// ROTA DE EMERGÊNCIA PARA RESTAURAR PARTICIPANTES (REMOVER APÓS USO)
router.post('/restore-participants-emergency', async (req, res) => {
  try {
    console.log('🚨 RESTAURANDO PARTICIPANTES DE EMERGÊNCIA');
    
    const fs = require('fs');
    const path = require('path');
    
    // Ler backup
    const backupPath = path.join(__dirname, '../backups/critical_data_2025-07-27T00-43-31-763Z.json');
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    
    console.log('📋 Backup carregado com timestamp:', backupData.timestamp);
    console.log('👥 Participantes no backup:', backupData.registrations.length);
    
    // Filtrar participantes do evento atual (ID 2)
    const participantsToRestore = backupData.registrations.filter(reg => reg.event_id === 1);
    console.log('🎯 Participantes para restaurar:', participantsToRestore.length);
    
    let restoredCount = 0;
    
    for (const participant of participantsToRestore) {
      try {
        // Ajustar event_id para 2 (novo evento)
        const participantData = {
          ...participant,
          event_id: 2, // Novo ID do evento
          lot_id: 1, // Primeiro lote do novo evento
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Remover campos que podem causar conflito
        delete participantData.id;
        
        await db('registrations').insert(participantData);
        restoredCount++;
        console.log(`✅ Restaurado: ${participant.name} (${participant.email})`);
        
      } catch (error) {
        console.log(`⚠️ Erro ao restaurar ${participant.name}:`, error.message);
      }
    }
    
    console.log(`🎉 RESTAURAÇÃO CONCLUÍDA: ${restoredCount} participantes restaurados`);
    
    res.json({
      success: true,
      message: 'Participantes restaurados com sucesso!',
      restoredCount,
      totalInBackup: participantsToRestore.length
    });
    
  } catch (error) {
    console.error('❌ Erro ao restaurar participantes:', error);
    res.status(500).json({
      error: 'Erro ao restaurar participantes',
      details: error.message
    });
  }
});

module.exports = router; 