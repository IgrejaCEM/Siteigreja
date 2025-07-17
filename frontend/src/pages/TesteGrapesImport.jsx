let grapesType = 'undefined';
try {
  const grapesjs = require('grapesjs');
  grapesType = typeof grapesjs;
} catch (e) {
  grapesType = 'ERRO: ' + e.message;
}

export default function TesteGrapesImport() {
  return (
    <div style={{ background: '#ff0', color: '#000', padding: 40, fontSize: 32 }}>
      TESTE GRAPESJS IMPORT: {grapesType}
    </div>
  );
} 