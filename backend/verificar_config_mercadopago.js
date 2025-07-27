require('dotenv').config();
const config = require('./src/config');

console.log('🔍 Verificando configurações do Mercado Pago...\n');

console.log('🌍 Ambiente:', process.env.NODE_ENV || 'development');
console.log('🔑 MERCADOPAGO_ACCESS_TOKEN:', process.env.MERCADOPAGO_ACCESS_TOKEN ? 'CONFIGURADO' : 'NÃO CONFIGURADO');
console.log('🔑 MERCADOPAGO_PUBLIC_KEY:', process.env.MERCADOPAGO_PUBLIC_KEY ? 'CONFIGURADO' : 'NÃO CONFIGURADO');
console.log('🔑 MERCADOPAGO_CLIENT_ID:', process.env.MERCADOPAGO_CLIENT_ID ? 'CONFIGURADO' : 'NÃO CONFIGURADO');
console.log('🔑 MERCADOPAGO_CLIENT_SECRET:', process.env.MERCADOPAGO_CLIENT_SECRET ? 'CONFIGURADO' : 'NÃO CONFIGURADO');

console.log('\n📋 Configurações no config:');
console.log('- accessToken:', config.payment?.mercadopago?.accessToken ? 'CONFIGURADO' : 'NÃO CONFIGURADO');
console.log('- publicKey:', config.payment?.mercadopago?.publicKey ? 'CONFIGURADO' : 'NÃO CONFIGURADO');
console.log('- clientId:', config.payment?.mercadopago?.clientId ? 'CONFIGURADO' : 'NÃO CONFIGURADO');
console.log('- clientSecret:', config.payment?.mercadopago?.clientSecret ? 'CONFIGURADO' : 'NÃO CONFIGURADO');
console.log('- sandbox:', config.payment?.mercadopago?.sandbox);

if (config.payment?.mercadopago?.accessToken) {
    const token = config.payment.mercadopago.accessToken;
    console.log('\n🔑 Tipo de token:', token.startsWith('APP_USR') ? 'PRODUÇÃO' : token.startsWith('TEST') ? 'SANDBOX' : 'DESCONHECIDO');
    console.log('🔑 Prefixo do token:', token.substring(0, 10) + '...');
} else {
    console.log('\n❌ ERRO: Token de acesso não configurado!');
}

console.log('\n✅ Verificação concluída.'); 