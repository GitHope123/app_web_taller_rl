import { useEffect, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  Fade,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  Brightness7 as Brightness7Icon,
  Brightness4 as Brightness4Icon,
  Security as SecurityIcon,
  LockPerson as LockPersonIcon,
} from '@mui/icons-material'
import {
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material'
import ModernDialog from '../components/ModernDialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'

import { authService } from '../services/authService'
import { ColorModeContext } from '../App'
import { useAuthStore } from '../store/useAuthStore'
import logoLight from '../assets/logo_48x48_main_light.svg'
import logoDark from '../assets/logo_48x48_main_dark.svg'

// Esquema de validación con Zod - DNI de exactamente 8 dígitos
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Por favor ingresa tu DNI')
    .regex(/^\d{8}$/, 'El DNI debe tener exactamente 8 dígitos'),
  password: z
    .string()
    .min(1, 'Por favor ingresa tu contraseña'),
})

// Iconos convertidos a componentes que aceptan color
const DniIcon = ({ color }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const LockIcon = ({ color }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

function Login() {
  const navigate = useNavigate()
  const theme = useTheme()
  const colorMode = useContext(ColorModeContext)

  // Zustand store
  const { isAuthenticated, setAuth } = useAuthStore()

  // State para error de API
  const [apiError, setApiError] = useState('')
  // State para diálogo de acceso restringido
  const [restrictedDialogOpen, setRestrictedDialogOpen] = useState(false)

  // Variable para determinar el modo de tema
  const isLightMode = theme.palette.mode === 'light'

  // React Query Mutation
  const loginMutation = useMutation({
    mutationFn: async (data) => {
      const result = await authService.login(data.email, data.password)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: (data) => {
      // VERIFICACIÓN DE ROL: Solo permitir acceso a 'admin'
      if (data.user?.rol !== 'admin') {
        // Cerrar sesión inmediatamente si no es admin
        authService.logout()
        setRestrictedDialogOpen(true)
        return
      }

      setAuth(data.user, data.token)
      navigate('/dashboard', { replace: true })
    },
    onError: (err) => {
      setApiError(err.message)
    }
  })

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  // Verificar si el usuario ya está autenticado al cargar la página
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate, isAuthenticated])

  const onSubmit = (data) => {
    setApiError('')
    const email = `${data.email.trim()}@taller.com`
    loginMutation.mutate({ ...data, email })
  }

  // Función para manejar el input y limitar a 8 dígitos
  const handleDniInput = (e) => {
    const value = e.target.value.replace(/\D/g, '') // Solo números
    e.target.value = value.slice(0, 8) // Máximo 8 dígitos
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: 'background.default',
        background: isLightMode
          ? `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`
          : `linear-gradient(135deg, ${theme.palette.background.default} 0%, #000000 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <Fade in={true} timeout={600}>
        <Container component="main" maxWidth="xs">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Login Card */}
            <Paper
              elevation={0}
              sx={{
                padding: { xs: 3, sm: 4 },
                width: '100%',
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                boxShadow: isLightMode
                  ? '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
                  : '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
                position: 'relative',
              }}
            >
              {/* Theme Toggle Button */}
              <Tooltip title="Toggle theme" placement="left">
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    color: 'text.secondary',
                  }}
                  onClick={colorMode.toggleColorMode}
                  color="inherit"
                >
                  {isLightMode ? <Brightness4Icon /> : <Brightness7Icon />}
                </IconButton>
              </Tooltip>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginBottom: 3,
                }}
              >
                <Box
                  component="img"
                  src={isLightMode ? logoLight : logoDark}
                  alt="R&L Taller Logo"
                  sx={{
                    width: 100,
                    height: 100,
                    marginBottom: 2,
                    objectFit: 'contain',
                  }}
                />
                <Typography
                  component="h1"
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                    marginBottom: 1,
                  }}
                >
                  Bienvenido
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Inicia sesión para continuar
                </Typography>
              </Box>

              {apiError && (
                <Alert severity="error" sx={{ marginBottom: 3 }}>
                  {apiError}
                </Alert>
              )}

              <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                sx={{ mt: 1 }}
              >
                <Box sx={{ marginBottom: 2.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      marginBottom: 1,
                      color: 'text.secondary',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    DNI (8 dígitos)
                  </Typography>
                  <TextField
                    fullWidth
                    id="email"
                    placeholder="12345678"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    disabled={loginMutation.isPending}
                    inputProps={{
                      maxLength: 8,
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                    }}
                    onInput={handleDniInput}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DniIcon color={theme.palette.text.secondary} />
                        </InputAdornment>
                      ),
                    }}
                    {...register('email')}
                  />
                </Box>

                <Box sx={{ marginBottom: 4 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      marginBottom: 1,
                      color: 'text.secondary',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Contraseña
                  </Typography>
                  <TextField
                    fullWidth
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    disabled={loginMutation.isPending}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color={theme.palette.text.secondary} />
                        </InputAdornment>
                      ),
                    }}
                    {...register('password')}
                  />
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loginMutation.isPending}
                  sx={{
                    py: 1.5,
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    boxShadow: theme.shadows[4],
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: theme.shadows[8],
                      transform: 'translateY(-2px)',
                    },
                    '&:disabled': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.5),
                    },
                  }}
                >
                  {loginMutation.isPending ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      <span>Verificando...</span>
                    </Box>
                  ) : (
                    'Acceder al Sistema'
                  )}
                </Button>
              </Box>
            </Paper>

            {/* Footer */}
            <Typography
              variant="caption"
              align="center"
              sx={{
                marginTop: 4,
                color: 'text.disabled',
                display: 'block',
              }}
            >
              © 2024 APP - R & L. Todos los derechos reservados.
              <br />
              Acceso seguro.
            </Typography>
          </Box>
        </Container>
      </Fade>

      {/* Diálogo de Acceso Restringido */}
      <ModernDialog
        open={restrictedDialogOpen}
        onClose={() => setRestrictedDialogOpen(false)}
        maxWidth="xs"
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'error.lighter', // Asumiendo que existe o usar alpha
              backgroundColor: (theme) => alpha(theme.palette.error.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <LockPersonIcon sx={{ fontSize: 32, color: 'error.main' }} />
          </Box>

          <DialogTitle sx={{ p: 0, mb: 1, fontWeight: 'bold', fontSize: '1.25rem' }}>
            Acceso Restringido
          </DialogTitle>

          <DialogContent sx={{ p: 0, mb: 3 }}>
            <DialogContentText sx={{ color: 'text.secondary', fontSize: '0.95rem' }}>
              Este sistema es de uso exclusivo para <strong>personal administrativo autorizado</strong>.
              <br /><br />
              Su cuenta no posee los privilegios necesarios para acceder a este panel. El intento de acceso ha sido registrado.
            </DialogContentText>
          </DialogContent>

          <DialogActions sx={{ p: 0, width: '100%' }}>
            <Button
              fullWidth
              variant="contained"
              color="error"
              onClick={() => setRestrictedDialogOpen(false)}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Entendido, cerrar sesión
            </Button>
          </DialogActions>
        </Box>
      </ModernDialog>
    </Box >
  )
}

export default Login