const Lot = require('../models/Lot');
const Registration = require('../models/Registration');

class LotController {
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Verificar se existem inscrições vinculadas ao lote
      const registrations = await Registration.query()
        .where('lot_id', id)
        .first();

      if (registrations) {
        return res.status(400).json({ 
          error: 'Não é possível excluir este lote pois existem inscrições vinculadas a ele.' 
        });
      }

      const deleted = await Lot.query()
        .deleteById(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Lote não encontrado' });
      }

      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar lote:', error);
      return res.status(500).json({ error: 'Erro ao deletar lote' });
    }
  }
}

module.exports = new LotController(); 