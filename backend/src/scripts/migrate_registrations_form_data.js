const { db } = require('../database/db');

async function migrateFormData() {
  try {
    const registrations = await db('registrations').select('*');
    let updated = 0;
    for (const reg of registrations) {
      // Se já tem form_data, pula
      if (reg.form_data) continue;
      // Monta objeto com todos os campos relevantes
      const formData = {
        name: reg.name,
        email: reg.email,
        phone: reg.phone,
        cpf: reg.cpf,
        address: reg.address,
        status: reg.status,
        registration_code: reg.registration_code,
        created_at: reg.created_at,
        updated_at: reg.updated_at,
        // Adicione outros campos conforme necessário
      };
      await db('registrations').where('id', reg.id).update({ form_data: JSON.stringify(formData) });
      updated++;
    }
    console.log(`Migração concluída. Registros atualizados: ${updated}`);
  } catch (err) {
    console.error('Erro na migração:', err);
  } finally {
    process.exit();
  }
}

migrateFormData(); 