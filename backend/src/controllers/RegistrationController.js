const Registration = require('../models/Registration');
const EventProduct = require('../models/EventProduct');
const RegistrationProduct = require('../models/RegistrationProduct');
const { generateRegistrationCode } = require('../utils/registrationUtils');

class RegistrationController {
  async create(req, res) {
    try {
      const {
        event_id,
        lot_id,
        name,
        email,
        phone,
        cpf,
        address,
        form_data,
        products
      } = req.body;

      const registrationCode = await generateRegistrationCode();

      const registration = await Registration.query().insert({
        event_id,
        lot_id,
        name,
        email,
        phone,
        cpf,
        address,
        form_data,
        registration_code: registrationCode,
        status: 'pending',
        payment_status: 'pending'
      });

      // Adiciona os produtos selecionados
      if (products && products.length > 0) {
        for (const product of products) {
          const eventProduct = await EventProduct.query().findById(product.product_id);
          
          if (!eventProduct) {
            throw new Error(`Produto ${product.product_id} não encontrado`);
          }

          if (eventProduct.stock < product.quantity) {
            throw new Error(`Estoque insuficiente para o produto ${eventProduct.name}`);
          }

          // Atualiza o estoque do produto
          await EventProduct.query()
            .patch({ stock: eventProduct.stock - product.quantity })
            .where('id', product.product_id);

          // Adiciona o produto à inscrição
          await RegistrationProduct.query().insert({
            registration_id: registration.id,
            product_id: product.product_id,
            quantity: product.quantity,
            unit_price: product.unit_price
          });
        }
      }

      return res.status(201).json(registration);
    } catch (error) {
      console.error('Erro ao criar inscrição:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  async list(req, res) {
    // Retorna uma lista vazia por enquanto
    return res.json([]);
  }

  async getById(req, res) {
    // Retorna um objeto vazio por enquanto
    return res.json({});
  }

  async update(req, res) {
    // Retorna mensagem de update por enquanto
    return res.json({ message: 'update' });
  }

  async delete(req, res) {
    // Retorna mensagem de delete por enquanto
    return res.json({ message: 'delete' });
  }
}

module.exports = new RegistrationController(); 