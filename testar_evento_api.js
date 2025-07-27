async function testarEventoAPI() {
  console.log('🔍 Testando API do evento ID 1...\n');
  
  try {
    console.log('📝 Buscando evento...');
    const response = await fetch('https://siteigreja-1.onrender.com/api/admin/events/1');
    const data = await response.json();
    
    console.log('✅ Evento encontrado!');
    console.log(`   Status: ${response.status}`);
    console.log(`   Título: ${data.title}`);
    console.log(`   Data original: ${data.date}`);
    console.log(`   Data formatada: ${formatDateForInput(data.date)}`);
    
  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
}

function formatDateForInput(dateString) {
  if (!dateString) return '';
  
  // Tentar diferentes formatos de data
  let date;
  
  // Se já está no formato correto (YYYY-MM-DDTHH:mm)
  if (dateString.includes('T')) {
    return dateString;
  }
  
  // Se tem formato com timezone (2025-10-24 00:00:00 00:00:00)
  if (dateString.includes(' 00:00:00 00:00:00')) {
    dateString = dateString.replace(' 00:00:00 00:00:00', '');
  }
  
  // Se tem formato com timezone (2025-10-24 00:00:00)
  if (dateString.includes(' 00:00:00')) {
    dateString = dateString.replace(' 00:00:00', '');
  }
  
  try {
    date = new Date(dateString);
    
    // Verificar se a data é válida
    if (isNaN(date.getTime())) {
      console.warn('Data inválida:', dateString);
      return '';
    }
    
    const pad = n => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '';
  }
}

testarEventoAPI(); 