import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AuthProvider } from './contexts/AuthContext';
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
import { AdminLayout } from './components/Sidebar';
import CheckIn from './pages/dashboard/CheckIn';
import TesteGrapesImport from './pages/TesteGrapesImport';
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
          <Router>
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/evento/:slug" element={<Evento />} />
              <Route path="/evento/:id/inscricao" element={<Inscricao />} />
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
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
