const express = require('express');
const router = express.Router();
const { authenticateToken: authMiddleware } = require('../middleware');
const { db } = require('../database/db');
const ExcelJS = require('exceljs');

// Obter transações com filtros
router.get('/transactions', authMiddleware, async (req, res) => {
  try {
    const {
      eventId,
      startDate,
      endDate,
      paymentStatus,
      paymentMethod
    } = req.query;

    let query = db('registrations as r')
      .select(
        'r.*',
        'e.title as event_title',
        'l.name as lot_name',
        'l.price as lot_price'
      )
      .leftJoin('events as e', 'r.event_id', 'e.id')
      .leftJoin('lots as l', 'r.lot_id', 'l.id');

    if (eventId) {
      query = query.where('r.event_id', eventId);
    }

    if (startDate) {
      query = query.where('r.created_at', '>=', new Date(startDate));
    }

    if (endDate) {
      query = query.where('r.created_at', '<=', new Date(endDate));
    }

    if (paymentStatus) {
      query = query.where('r.payment_status', paymentStatus);
    }

    const registrations = await query.orderBy('r.created_at', 'desc');
    
    // Processar dados incluindo produtos
    const transactions = registrations.map(registration => {
      let productsTotal = 0;
      let products = [];
      
      try {
        if (registration.products) {
          products = JSON.parse(registration.products);
          productsTotal = products.reduce((total, product) => {
            return total + (parseFloat(product.price) * product.quantity);
          }, 0);
        }
      } catch (error) {
        console.error('Erro ao processar produtos:', error);
      }
      
      const lotTotal = parseFloat(registration.lot_price || 0);
      const totalAmount = lotTotal + productsTotal;
      
      return {
        id: registration.id,
        registration_code: registration.registration_code,
        event_title: registration.event_title,
        lot_name: registration.lot_name,
        customer_name: registration.name,
        lot_price: lotTotal,
        products_total: productsTotal,
        total_amount: totalAmount,
        payment_status: registration.payment_status,
        status: registration.status,
        created_at: registration.created_at,
        products: products
      };
    });
    
    res.json(transactions);
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ message: 'Erro ao buscar transações', error: error.message });
  }
});

// Obter resumo financeiro
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const {
      eventId,
      startDate,
      endDate,
      paymentStatus,
      paymentMethod
    } = req.query;

    let baseQuery = db('registrations as r')
      .leftJoin('events as e', 'r.event_id', 'e.id')
      .leftJoin('lots as l', 'r.lot_id', 'l.id');

    if (eventId) {
      baseQuery = baseQuery.where('r.event_id', eventId);
    }

    if (startDate) {
      baseQuery = baseQuery.where('r.created_at', '>=', new Date(startDate));
    }

    if (endDate) {
      baseQuery = baseQuery.where('r.created_at', '<=', new Date(endDate));
    }

    if (paymentStatus) {
      baseQuery = baseQuery.where('r.payment_status', paymentStatus);
    }

    // Buscar todas as registrations para calcular totais incluindo produtos
    const registrations = await baseQuery.clone().select('*');
    
    let totalRevenue = 0;
    let totalTransactions = registrations.length;
    let revenueByEvent = {};
    let revenueByPaymentMethod = {};
    let revenueByMonth = {};
    
    registrations.forEach(registration => {
      let productsTotal = 0;
      
      try {
        if (registration.products) {
          const products = JSON.parse(registration.products);
          productsTotal = products.reduce((total, product) => {
            return total + (parseFloat(product.price) * product.quantity);
          }, 0);
        }
      } catch (error) {
        console.error('Erro ao processar produtos:', error);
      }
      
      const lotTotal = parseFloat(registration.lot_price || 0);
      const totalAmount = lotTotal + productsTotal;
      
      totalRevenue += totalAmount;
      
      // Receita por evento
      const eventTitle = registration.event_title || 'Sem evento';
      revenueByEvent[eventTitle] = (revenueByEvent[eventTitle] || 0) + totalAmount;
      
      // Receita por método de pagamento (usando status como proxy)
      const paymentMethod = registration.payment_status || 'pending';
      revenueByPaymentMethod[paymentMethod] = (revenueByPaymentMethod[paymentMethod] || 0) + totalAmount;
      
      // Receita por mês
      const month = new Date(registration.created_at).toISOString().substring(0, 7);
      revenueByMonth[month] = (revenueByMonth[month] || 0) + totalAmount;
    });
    
    const summary = {
      totalRevenue: totalRevenue,
      totalTransactions: totalTransactions,
      averageTicketValue: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
      revenueByEvent: revenueByEvent,
      revenueByPaymentMethod: revenueByPaymentMethod,
      revenueByMonth: revenueByMonth
    };

    res.json(summary);
  } catch (error) {
    console.error('Erro ao buscar resumo financeiro:', error);
    res.status(500).json({ message: 'Erro ao buscar resumo financeiro', error: error.message });
  }
});

// Exportar relatório financeiro
router.get('/export', authMiddleware, async (req, res) => {
  try {
    const {
      eventId,
      startDate,
      endDate,
      paymentStatus,
      paymentMethod
    } = req.query;

    let query = db('transactions as t')
      .select(
        't.id',
        'e.title as event_title',
        't.created_at',
        'u.name as customer_name',
        't.amount',
        't.payment_method',
        't.status'
      )
      .leftJoin('events as e', 't.event_id', 'e.id')
      .leftJoin('users as u', 't.user_id', 'u.id');

    if (eventId) {
      query = query.where('t.event_id', eventId);
    }

    if (startDate) {
      query = query.where('t.created_at', '>=', new Date(startDate));
    }

    if (endDate) {
      query = query.where('t.created_at', '<=', new Date(endDate));
    }

    if (paymentStatus) {
      query = query.where('t.status', paymentStatus);
    }

    if (paymentMethod) {
      query = query.where('t.payment_method', paymentMethod);
    }

    const transactions = await query.orderBy('t.created_at', 'desc');

    // Criar workbook Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Relatório Financeiro');

    // Definir cabeçalhos
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Evento', key: 'event_title', width: 30 },
      { header: 'Data', key: 'created_at', width: 20 },
      { header: 'Cliente', key: 'customer_name', width: 30 },
      { header: 'Valor', key: 'amount', width: 15 },
      { header: 'Método de Pagamento', key: 'payment_method', width: 20 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    // Adicionar dados
    worksheet.addRows(transactions);

    // Formatar células
    worksheet.getColumn('amount').numFmt = '"R$ "#,##0.00';
    worksheet.getColumn('created_at').numFmt = 'dd/mm/yyyy hh:mm:ss';

    // Configurar resposta
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=relatorio-financeiro.xlsx'
    );

    // Enviar arquivo
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Erro ao exportar relatório:', error);
    res.status(500).json({ message: 'Erro ao exportar relatório', error: error.message });
  }
});

module.exports = router; 