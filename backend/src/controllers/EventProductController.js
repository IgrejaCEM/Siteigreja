const EventProduct = require('../models/EventProduct');
const { uploadToS3 } = require('../services/s3Service');

class EventProductController {
  async create(req, res) {
    try {
      const { event_id, name, description, price, stock, image_url } = req.body;
      const image = req.file;

      let finalImageUrl = image_url;
      if (!finalImageUrl) {
        if (!image) {
          return res.status(400).json({ error: 'Imagem é obrigatória (arquivo ou URL)' });
        }
        finalImageUrl = await uploadToS3(image, 'products');
      }

      const product = await EventProduct.query().insert({
        event_id: Number(event_id),
        name,
        description,
        price: Number(price),
        image_url: finalImageUrl,
        stock: Number(stock),
        is_active: true
      });

      return res.status(201).json(product);
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      return res.status(500).json({ error: 'Erro ao criar produto' });
    }
  }

  async listByEvent(req, res) {
    try {
      const { event_id } = req.params;
      const products = await EventProduct.query()
        .where('event_id', event_id)
        .where('is_active', true)
        .orderBy('created_at', 'desc');

      return res.json(products);
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      return res.status(500).json({ error: 'Erro ao listar produtos' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description, price, stock, is_active, image_url } = req.body;
      const image = req.file;

      const updateData = {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        is_active
      };

      if (image_url) {
        updateData.image_url = image_url;
      } else if (image) {
        updateData.image_url = await uploadToS3(image, 'products');
      }

      const product = await EventProduct.query()
        .patchAndFetchById(id, updateData);

      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      return res.json(product);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      return res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await EventProduct.query()
        .deleteById(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      return res.status(500).json({ error: 'Erro ao deletar produto' });
    }
  }
}

module.exports = new EventProductController(); 