const { db } = require('../database/db');
const StoreProduct = require('../models/StoreProduct');

class EventStoreController {
  constructor() {
    this.getEventProducts = this.getEventProducts.bind(this);
    this.addProductToEvent = this.addProductToEvent.bind(this);
    this.removeProductFromEvent = this.removeProductFromEvent.bind(this);
  }

  // Buscar produtos da loja geral disponíveis para um evento
  async getEventProducts(req, res) {
    try {
      const { event_id } = req.params;
      console.log('🛍️ Buscando produtos da loja geral para evento:', event_id);

      // Buscar todos os produtos ativos da loja geral
      const products = await db('store_products')
        .where('active', true)
        .orderBy('name', 'asc');

      console.log('✅ Produtos encontrados:', products.length);

      return res.status(200).json({
        success: true,
        event_id: parseInt(event_id),
        products: products,
        message: `Produtos da loja geral disponíveis para o evento ${event_id}`
      });

    } catch (error) {
      console.error('❌ Erro ao buscar produtos do evento:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // Adicionar produto da loja geral a um evento (opcional - para controle)
  async addProductToEvent(req, res) {
    try {
      const { event_id } = req.params;
      const { product_id } = req.body;

      console.log('➕ Adicionando produto à loja do evento:', { event_id, product_id });

      // Verificar se o produto existe na loja geral
      const product = await db('store_products')
        .where('id', product_id)
        .where('active', true)
        .first();

      if (!product) {
        return res.status(404).json({
          error: 'Produto não encontrado',
          details: 'O produto não existe na loja geral'
        });
      }

      // Aqui você pode adicionar lógica para associar produtos a eventos específicos
      // Por enquanto, todos os produtos da loja geral estão disponíveis para todos os eventos

      return res.status(200).json({
        success: true,
        message: `Produto ${product.name} disponível para o evento ${event_id}`,
        product: product
      });

    } catch (error) {
      console.error('❌ Erro ao adicionar produto ao evento:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // Remover produto da loja do evento (opcional - para controle)
  async removeProductFromEvent(req, res) {
    try {
      const { event_id, product_id } = req.params;

      console.log('➖ Removendo produto da loja do evento:', { event_id, product_id });

      // Aqui você pode adicionar lógica para remover produtos de eventos específicos
      // Por enquanto, todos os produtos da loja geral estão disponíveis para todos os eventos

      return res.status(200).json({
        success: true,
        message: `Produto removido da loja do evento ${event_id}`,
        event_id: parseInt(event_id),
        product_id: parseInt(product_id)
      });

    } catch (error) {
      console.error('❌ Erro ao remover produto do evento:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }
}

module.exports = new EventStoreController(); 