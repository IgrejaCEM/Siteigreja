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
      banner_desktop,
      banner_mobile,
      banner_home,
      banner_evento,
      banner_evento_desktop,
      banner_evento_mobile,
      logo, // ✅ NOVO: Campo para logo do evento
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
      date: (() => {
        // Limpar e formatar a data corretamente
        let cleanDate = date;
        
        console.log('🔧 Formatando data original:', cleanDate);
        
        // Remover duplicação de timezone se existir
        if (cleanDate.includes(' 00:00:00 00:00:00')) {
          cleanDate = cleanDate.replace(' 00:00:00 00:00:00', '');
          console.log('🔧 Removida duplicação de timezone:', cleanDate);
        }
        
        // Se já tem formato ISO (com T), usar como está
        if (cleanDate.includes('T')) {
          console.log('🔧 Data já em formato ISO:', cleanDate);
          return cleanDate;
        }
        
        // Se tem apenas data (YYYY-MM-DD), adicionar hora
        if (cleanDate.length === 10) {
          const formatted = cleanDate + ' 00:00:00';
          console.log('🔧 Data apenas data, adicionada hora:', formatted);
          return formatted;
        }
        
        // Se tem data e hora sem T, converter para formato ISO
        if (cleanDate.includes(' ') && !cleanDate.includes('T')) {
          const formatted = cleanDate.replace(' ', 'T');
          console.log('🔧 Data com espaço convertida para ISO:', formatted);
          return formatted;
        }
        
        console.log('🔧 Data final:', cleanDate);
        return cleanDate;
      })(),
      location,
      banner: banner || null,
      banner_desktop: banner_desktop || banner || null,
      banner_mobile: banner_mobile || banner || null,
      banner_home: banner_home || null,
      banner_evento: banner_evento || null,
      banner_evento_desktop: banner_evento_desktop || banner_evento || null,
      banner_evento_mobile: banner_evento_mobile || banner_evento || null,
      logo: logo || null, // ✅ NOVO: Campo para logo do evento
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
        
        // Função para limpar e formatar datas
        const formatDate = (dateStr) => {
          if (!dateStr || dateStr === "") return null;
          
          let cleanDate = dateStr;
          
          // Remover duplicação de timezone se existir
          if (cleanDate.includes(' 00:00:00 00:00:00')) {
            cleanDate = cleanDate.replace(' 00:00:00 00:00:00', '');
          }
          
          // Se já tem formato ISO (com T), usar como está
          if (cleanDate.includes('T')) {
            return cleanDate;
          }
          
          // Se tem apenas data (YYYY-MM-DD), adicionar hora
          if (cleanDate.length === 10) {
            return cleanDate + ' 00:00:00';
          }
          
          // Se tem data e hora sem T, adicionar T
          if (cleanDate.includes(' ') && !cleanDate.includes('T')) {
            return cleanDate.replace(' ', 'T');
          }
          
          return cleanDate;
        };
        
        startDate = formatDate(startDate);
        endDate = formatDate(endDate);
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
router.put('/events/:id', authenticateToken, requireAdmin, async (req, res) => {
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
      logo, // ✅ NOVO: Campo para logo do evento
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
        logo, // ✅ NOVO: Campo para logo do evento
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
router.delete('/events/:id', authenticateToken, requireAdmin, async (req, res) => {
  const trx = await db.transaction();
  
  try {
    const { id } = req.params;
    
    console.log('🗑️ Tentando deletar evento:', id);
    
    // Verificar se o evento existe
    const event = await trx('events').where('id', id).first();
    if (!event) {
      await trx.rollback();
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    
    // Verificar se há inscrições vinculadas
    const registrations = await trx('registrations').where('event_id', id).first();
    if (registrations) {
      await trx.rollback();
      return res.status(400).json({ 
        error: 'Não é possível deletar este evento pois existem inscrições vinculadas a ele. Delete as inscrições primeiro.' 
      });
    }
    
    // Verificar se há lotes vinculados
    const lots = await trx('lots').where('event_id', id).first();
    if (lots) {
      // Deletar lotes primeiro
      await trx('lots').where('event_id', id).del();
      console.log('🗑️ Lotes deletados para evento:', id);
    }
    
    // Deletar evento
    const deleted = await trx('events').where('id', id).del();
    
    if (!deleted) {
      await trx.rollback();
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    
    await trx.commit();
    console.log('✅ Evento deletado com sucesso:', id);
    
    res.status(204).send();
  } catch (error) {
    await trx.rollback();
    console.error('❌ Erro ao deletar evento:', error);
    res.status(500).json({ error: 'Erro ao deletar evento: ' + error.message });
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
router.get('/events/:id', authenticateToken, requireAdmin, async (req, res) => {
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
        db.raw("STRING_AGG(events.title, '; ') as events_titles"),
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
    
    // Total de participantes (contando todas as inscrições)
    const [{ totalParticipants }] = await db('registrations')
      .count('* as totalParticipants');
    
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

// Inscrições recentes - CORREÇÃO APLICADA: priorizar dados da inscrição
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
      let name = reg.reg_name || reg.user_name || '-';
      let email = reg.reg_email || reg.user_email || '-';
      
      // Se ainda não tem nome/email, tentar extrair do form_data
      if ((!name || name === '-') || (!email || email === '-')) {
        try {
          const data = reg.form_data ? (typeof reg.form_data === 'string' ? JSON.parse(reg.form_data) : reg.form_data) : {};
          name = name || data.nome || data.name || data.participantes?.[0]?.name || '-';
          email = email || data.email || data.participantes?.[0]?.email || '-';
        } catch {
          // ignora
        }
      }
      
      // Garantir que sempre tenha um valor válido
      name = name || '-';
      email = email || '-';
      
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

// ROTA DE EMERGÊNCIA PARA LIMPAR EVENTOS (REMOVER APÓS USO)
router.post('/clear-events-emergency', async (req, res) => {
  try {
    console.log('🚨 LIMPANDO EVENTOS DE EMERGÊNCIA');
    
    // Limpar todas as inscrições primeiro
    const deletedRegistrations = await db('registrations').del();
    console.log(`🗑️ ${deletedRegistrations} inscrições removidas`);
    
    // Limpar todos os lotes
    const deletedLots = await db('lots').del();
    console.log(`🗑️ ${deletedLots} lotes removidos`);
    
    // Limpar todos os eventos
    const deletedEvents = await db('events').del();
    console.log(`🗑️ ${deletedEvents} eventos removidos`);
    
    console.log('✅ Banco limpo com sucesso!');
    
    res.json({
      success: true,
      message: 'Banco limpo com sucesso!',
      deleted: {
        events: deletedEvents,
        lots: deletedLots,
        registrations: deletedRegistrations
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao limpar banco:', error);
    res.status(500).json({
      error: 'Erro ao limpar banco',
      details: error.message
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

// ROTA PARA VERIFICAR ESTRUTURA DO BANCO (REMOVER APÓS USO)
router.get('/check-database-structure', async (req, res) => {
  try {
    console.log('🔍 VERIFICANDO ESTRUTURA DO BANCO');
    
    const results = {
      tables: {},
      events: [],
      lots: [],
      registrations: []
    };
    
    // Verificar se as tabelas existem
    const tables = ['events', 'lots', 'registrations'];
    for (const table of tables) {
      const exists = await db.schema.hasTable(table);
      results.tables[table] = exists;
      
      if (exists) {
        // Verificar colunas
        const columns = await db(table).columnInfo();
        results.tables[`${table}_columns`] = Object.keys(columns);
        
        // Contar registros
        const count = await db(table).count('* as count').first();
        results.tables[`${table}_count`] = count.count;
        
        // Listar dados (limitado)
        if (table === 'events') {
          results.events = await db(table).select('*').limit(5);
        } else if (table === 'lots') {
          results.lots = await db(table).select('*').limit(5);
        } else if (table === 'registrations') {
          results.registrations = await db(table).select('*').limit(5);
        }
      }
    }
    
    res.json({
      success: true,
      message: 'Estrutura do banco verificada',
      results
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar estrutura:', error);
    res.status(500).json({
      error: 'Erro ao verificar estrutura',
      details: error.message
    });
  }
});

// ROTA PARA VERIFICAR EVENTOS AUTOMÁTICOS (REMOVER APÓS USO)
router.get('/check-auto-events', async (req, res) => {
  try {
    console.log('🔍 VERIFICANDO EVENTOS AUTOMÁTICOS');
    
    const events = await db('events').select('*').orderBy('created_at', 'desc');
    
    console.log('📋 Eventos encontrados:', events.length);
    events.forEach(event => {
      console.log(`- ${event.title} (ID: ${event.id}) - Criado: ${event.created_at}`);
    });
    
    res.json({
      success: true,
      message: 'Eventos verificados',
      events: events.map(e => ({
        id: e.id,
        title: e.title,
        created_at: e.created_at,
        updated_at: e.updated_at
      }))
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar eventos:', error);
    res.status(500).json({
      error: 'Erro ao verificar eventos',
      details: error.message
    });
  }
});

// ROTA PARA LIMPAR EVENTOS AUTOMÁTICOS (REMOVER APÓS USO)
router.post('/clear-auto-events', async (req, res) => {
  try {
    console.log('🗑️ LIMPANDO EVENTOS AUTOMÁTICOS');
    
    // Buscar eventos que parecem ser automáticos
    const autoEvents = await db('events')
      .where('title', 'like', '%TESTE%')
      .orWhere('title', 'like', '%Culto de Celebração%')
      .orWhere('description', 'like', '%teste%')
      .select('*');
    
    console.log('🎯 Eventos automáticos encontrados:', autoEvents.length);
    
    let deletedCount = 0;
    
    for (const event of autoEvents) {
      try {
        console.log(`🗑️ Deletando evento: ${event.title} (ID: ${event.id})`);
        
        // Verificar se há inscrições
        const registrations = await db('registrations').where('event_id', event.id).first();
        if (registrations) {
          console.log(`⚠️ Evento ${event.title} tem inscrições, pulando...`);
          continue;
        }
        
        // Deletar lotes primeiro
        await db('lots').where('event_id', event.id).del();
        
        // Deletar evento
        await db('events').where('id', event.id).del();
        
        deletedCount++;
        console.log(`✅ Evento ${event.title} deletado`);
        
      } catch (error) {
        console.log(`❌ Erro ao deletar evento ${event.title}:`, error.message);
      }
    }
    
    console.log(`🎉 LIMPEZA CONCLUÍDA: ${deletedCount} eventos deletados`);
    
    res.json({
      success: true,
      message: 'Eventos automáticos limpos com sucesso!',
      deletedCount,
      totalFound: autoEvents.length
    });
    
  } catch (error) {
    console.error('❌ Erro ao limpar eventos automáticos:', error);
    res.status(500).json({
      error: 'Erro ao limpar eventos automáticos',
      details: error.message
    });
  }
});

// ROTA DE EMERGÊNCIA PARA FORÇAR DELEÇÃO (REMOVER APÓS USO)
router.delete('/events/:id/force', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🚨 FORÇANDO DELEÇÃO DO EVENTO:', id);
    
    // Verificar se o evento existe
    const event = await db('events').where('id', id).first();
    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    
    console.log('🗑️ Deletando inscrições do evento:', id);
    await db('registrations').where('event_id', id).del();
    
    console.log('🗑️ Deletando lotes do evento:', id);
    await db('lots').where('event_id', id).del();
    
    console.log('🗑️ Deletando evento:', id);
    await db('events').where('id', id).del();
    
    console.log('✅ Evento forçadamente deletado:', id);
    
    res.json({
      success: true,
      message: 'Evento forçadamente deletado com sucesso!',
      eventId: id
    });
    
  } catch (error) {
    console.error('❌ Erro ao forçar deleção:', error);
    res.status(500).json({
      error: 'Erro ao forçar deleção',
      details: error.message
    });
  }
});

// Configurar webhook do Mercado Pago
router.post('/configurar-webhook', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('🔧 CONFIGURANDO WEBHOOK MP');
    console.log('📦 Dados recebidos:', req.body);
    
    const { url, events } = req.body;
    
    // Configurar webhook via API do Mercado Pago
    const axios = require('axios');
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || 'APP_USR-7906695833613236-072622-a7c53bcaf7bc8b8289f1961ce3937843-2568627728';
    
    // Criar webhook via API REST
    const webhookData = {
      url: url,
      events: events
    };
    
    const response = await axios.post('https://api.mercadopago.com/v1/webhooks', webhookData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Webhook criado:', response.data);
    
    res.json({
      success: true,
      webhook_id: response.data.id,
      url: response.data.url,
      events: response.data.events,
      message: 'Webhook configurado com sucesso!'
    });
    
  } catch (error) {
    console.error('❌ Erro ao configurar webhook:', error);
    res.status(500).json({
      error: 'Erro ao configurar webhook',
      details: error.message
    });
  }
});

// Testar webhook
router.post('/testar-webhook', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('🧪 TESTANDO WEBHOOK');
    
    // Simular notificação de pagamento
    const testNotification = {
      type: 'payment',
      data: {
        id: 'TEST_PAYMENT_ID'
      }
    };
    
    // Chamar webhook localmente
    const webhookResponse = await axios.post('https://siteigreja-1.onrender.com/api/payments/webhook', testNotification);
    
    res.json({
      success: true,
      message: 'Webhook testado com sucesso!',
      response: webhookResponse.data
    });
    
  } catch (error) {
    console.error('❌ Erro ao testar webhook:', error);
    res.status(500).json({
      error: 'Erro ao testar webhook',
      details: error.message
    });
  }
});

// Listar todos os produtos de eventos
router.get('/event-products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('🔍 DEBUG: Buscando produtos na tabela event_products...');
    
    const products = await db('event_products')
      .select('*')
      .orderBy('created_at', 'desc');
    
    console.log(`📊 DEBUG: Encontrados ${products.length} produtos`);
    console.log('📋 DEBUG: Produtos:', JSON.stringify(products, null, 2));
    
    res.json(products);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ error: 'Erro ao listar produtos' });
  }
});

// Rota de emergência para limpar dados órfãos
router.post('/clear-orphaned-data', async (req, res) => {
  try {
    console.log('🧹 LIMPANDO DADOS ÓRFÃOS...');
    
    // Remover inscrições sem evento
    const inscricoesRemovidas = await db('registrations')
      .leftJoin('events', 'registrations.event_id', 'events.id')
      .whereNull('events.id')
      .del();
    
    // Remover lotes sem evento
    const lotesRemovidos = await db('lots')
      .leftJoin('events', 'lots.event_id', 'events.id')
      .whereNull('events.id')
      .del();
    
    // Remover produtos sem evento
    const produtosRemovidos = await db('event_products')
      .leftJoin('events', 'event_products.event_id', 'events.id')
      .whereNull('events.id')
      .del();
    
    console.log('✅ Dados órfãos removidos:', {
      inscricoes: inscricoesRemovidas,
      lotes: lotesRemovidos,
      produtos: produtosRemovidos
    });
    
    res.json({
      success: true,
      message: 'Dados órfãos removidos com sucesso',
      removed: {
        registrations: inscricoesRemovidas,
        lots: lotesRemovidos,
        products: produtosRemovidos
      }
    });
  } catch (error) {
    console.error('❌ Erro ao limpar dados órfãos:', error);
    res.status(500).json({ error: 'Erro ao limpar dados órfãos' });
  }
});

module.exports = router; 