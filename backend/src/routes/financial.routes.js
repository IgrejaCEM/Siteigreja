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

    let query = db('transactions as t')
      .select(
        't.*',
        'e.title as event_title',
        'u.name as customer_name'
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

    let baseQuery = db('transactions as t');

    if (eventId) {
      baseQuery = baseQuery.where('t.event_id', eventId);
    }

    if (startDate) {
      baseQuery = baseQuery.where('t.created_at', '>=', new Date(startDate));
    }

    if (endDate) {
      baseQuery = baseQuery.where('t.created_at', '<=', new Date(endDate));
    }

    if (paymentStatus) {
      baseQuery = baseQuery.where('t.status', paymentStatus);
    }

    if (paymentMethod) {
      baseQuery = baseQuery.where('t.payment_method', paymentMethod);
    }

    // Total de receita
    const totalRevenue = await baseQuery.clone().sum('amount as total').first();

    // Total de transações
    const totalTransactions = await baseQuery.clone().count('* as total').first();

    // Receita por evento
    const revenueByEvent = await baseQuery.clone()
      .leftJoin('events as e', 't.event_id', 'e.id')
      .select('e.title')
      .sum('t.amount as total')
      .groupBy('e.title');

    // Receita por método de pagamento
    const revenueByPaymentMethod = await baseQuery.clone()
      .select('payment_method')
      .sum('amount as total')
      .groupBy('payment_method');

    // Receita por mês
    const revenueByMonth = await baseQuery.clone()
      .select(db.raw("strftime('%Y-%m', created_at) as month"))
      .sum('amount as total')
      .groupBy('month')
      .orderBy('month');

    const summary = {
      totalRevenue: parseFloat(totalRevenue?.total || 0),
      totalTransactions: parseInt(totalTransactions?.total || 0),
      averageTicketValue: totalTransactions?.total > 0 
        ? parseFloat(totalRevenue?.total || 0) / parseInt(totalTransactions?.total || 0) 
        : 0,
      revenueByEvent: Object.fromEntries(
        revenueByEvent.map(row => [row.title || 'Sem evento', parseFloat(row.total || 0)])
      ),
      revenueByPaymentMethod: Object.fromEntries(
        revenueByPaymentMethod.map(row => [row.payment_method, parseFloat(row.total || 0)])
      ),
      revenueByMonth: Object.fromEntries(
        revenueByMonth.map(row => [row.month, parseFloat(row.total || 0)])
      )
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