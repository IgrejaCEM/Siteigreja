const axios = require('axios');

const API_BASE_URL = 'https://siteigreja-1.onrender.com/api';

async function restaurarParticipantes() {
  console.log('🚨 RESTAURANDO PARTICIPANTES');
  console.log('==============================');
  
  try {
    console.log('📡 [1/2] Aguardando deploy...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log('📡 [2/2] Chamando rota de restauração...');
    const response = await axios.post(`${API_BASE_URL}/admin/restore-participants-emergency`);
    
    if (response.status === 200) {
      console.log('✅ PARTICIPANTES RESTAURADOS COM SUCESSO!');
      console.log('📋 Resposta:', response.data);
      
      // Aguardar um pouco
      console.log('⏳ Aguardando 3 segundos...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Verificar se os participantes foram restaurados
      console.log('🔍 Verificando participantes restaurados...');
      const participantsResponse = await axios.get(`${API_BASE_URL}/admin/registrations`);
      
      if (participantsResponse.status === 200) {
        console.log('✅ PARTICIPANTES CONFIRMADOS!');
        console.log('📋 Total de participantes:', participantsResponse.data.length);
        
        participantsResponse.data.slice(0, 5).forEach((participant, index) => {
          console.log(`   ${index + 1}. ${participant.name} (${participant.email})`);
        });
        
        console.log('\n🌐 Links para testar:');
        console.log('   Admin participantes: https://igrejacemchurch.org/admin/participantes');
        console.log('   Admin dashboard: https://igrejacemchurch.org/admin');
      } else {
        console.log('❌ Erro ao verificar participantes');
      }
    } else {
      console.log('❌ Erro na restauração:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Erro ao restaurar participantes:', error.message);
    if (error.response) {
      console.error('📋 Status:', error.response.status);
      console.error('📄 Resposta:', error.response.data);
    }
  }
}

restaurarParticipantes(); 