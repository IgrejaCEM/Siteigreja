# Sistema de Eventos da Igreja

Sistema de gerenciamento de eventos para igrejas, desenvolvido com React (frontend) e Node.js/Express/SQLite (backend).

## Funcionalidades

- Autenticação de usuários (admin e participantes)
- Criação e gerenciamento de eventos
- Inscrições em eventos
- Gerenciamento de participantes
- Relatórios e estatísticas
- Interface responsiva e moderna

## Requisitos

- Node.js 14+
- npm ou yarn

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/igreja.git
cd igreja
```

2. Instale as dependências do backend:
```bash
cd backend
npm install
```

3. Instale as dependências do frontend:
```bash
cd ../frontend
npm install
```

## Configuração

1. O banco de dados SQLite será criado automaticamente na primeira execução
2. Um usuário admin padrão será criado:
   - Email: admin@example.com
   - Senha: admin123

## Executando o Projeto

1. Inicie o backend:
```bash
cd backend
npm run dev
```

2. Em outro terminal, inicie o frontend:
```bash
cd frontend
npm run dev
```

3. Acesse o sistema em `http://localhost:5173`

## Estrutura do Projeto

```
igreja/
├── backend/
│   ├── src/
│   │   ├── index.js
│   │   ├── routes.js
│   │   └── database.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## Tecnologias Utilizadas

- Frontend:
  - React
  - Vite
  - Material-UI
  - React Router
  - Axios
  - Chart.js

- Backend:
  - Node.js
  - Express
  - SQLite
  - JWT
  - Bcrypt

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes. 