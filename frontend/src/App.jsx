// Cache busting - 2025-07-27 20:50 - Frontend fix
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ErrorBoundary from './components/ErrorBoundary';
import { RequireAuth } from './components/RequireAuth';
import 'grapesjs/dist/css/grapes.min.css';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Eventos from './pages/Eventos';
import EditarEvento from './pages/EditarEvento';
import CriarEvento from './pages/CriarEvento';
import Participantes from './pages/dashboard/Participantes';
import Financeiro from './pages/dashboard/Financeiro';
import FinanceiroWrapper from './pages/dashboard/FinanceiroWrapper';
import EditorHome from './pages/dashboard/EditorHome';
import Home from './pages/Home';
import Evento from './pages/Evento';
import Inscricao from './pages/Inscricao';
import Store from './pages/Store';
import Checkout from './pages/Checkout';
import { AdminLayout } from './components/Sidebar';
import CheckIn from './pages/dashboard/CheckIn';
import ProdutosComprados from './pages/dashboard/ProdutosComprados';
import TesteGrapesImport from './pages/TesteGrapesImport';
import Loja from './pages/dashboard/Loja';
// import TesteGrapes from './pages/TesteGrapes';

// Styles
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        // Suprimir warnings de -ms-high-contrast
        '@media (-ms-high-contrast: active), (-ms-high-contrast: none)': {
          // Regras vazias para suprimir warnings
        },
        // Forced Colors Mode - nova especificação
        '@media (forced-colors: active)': {
          // Regras para modo de cores forçadas
        },
      },
    },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <CartProvider>
            <Router>
              <Routes>
                {/* Rotas Públicas */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/evento/:slug" element={<Evento />} />
                <Route path="/evento/:id/inscricao" element={<Inscricao />} />
                <Route path="/loja" element={<Store />} />
                <Route path="/checkout" element={<Checkout />} />
                {/* Fallback: qualquer rota desconhecida redireciona para a home */}
                <Route path="*" element={<Home />} />
                
                {/* Rotas Admin */}
                <Route path="/admin/*" element={
                    <AdminLayout>
                      <Routes>
                        <Route path="/" element={<AdminDashboard />} />
                        <Route path="eventos" element={<Eventos />} />
                        <Route path="participantes" element={<Participantes />} />
                        <Route path="financeiro" element={<Financeiro />} />
                        <Route path="checkin" element={<CheckIn />} />
                        <Route path="produtos-comprados" element={<ProdutosComprados />} />
                        <Route path="loja" element={<Loja />} />
                        <Route path="editor-home" element={<EditorHome />} />
                        <Route path="criar-evento" element={<CriarEvento />} />
                        <Route path="editar-evento/:id" element={<EditarEvento />} />
                        <Route path="financeiro-evento/:id" element={<FinanceiroWrapper />} />
                      </Routes>
                    </AdminLayout>
                } />
                <Route path="/editor-home-teste" element={<EditorHome />} />
                <Route path="/teste-grapes-import" element={<TesteGrapesImport />} />
              </Routes>
            </Router>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
// Cache busting - $(date) 
// TEMPORARY: Cache busting for price.toFixed fix - $(new Date().toISOString()) 
