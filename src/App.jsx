import { useState, useMemo, createContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import getTheme from './theme/theme'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Usuarios from './pages/Usuarios'
import Registros from './pages/Registros'
import Operaciones from './pages/Operaciones'
import Pedidos from './pages/Pedidos'
import AsignacionEmpleado from './pages/Asignacion_Empleado'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

export const ColorModeContext = createContext({ toggleColorMode: () => { } }) // Mantener en una línea para evitar conflictos


function App() {
  const [mode, setMode] = useState('light')

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
      },
      mode
    }),
    [],
  )

  const theme = useMemo(() => getTheme(mode), [mode])

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Ruta de login */}
            <Route path="/login" element={<Login />} />

            {/* Rutas protegidas */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="usuarios" element={<Usuarios />} />
              <Route path="registros" element={<Registros />} />
              <Route path="operaciones" element={<Operaciones />} />
              <Route path="pedidos" element={<Pedidos />} />
              <Route path="asignacion-operaciones" element={<AsignacionEmpleado />} />
            </Route>

            {/* Redirigir todas las rutas desconocidas al login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}

export default App
