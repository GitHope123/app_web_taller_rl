import { useState, useEffect, useMemo } from 'react'

import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  useTheme,
  Stack,
  Avatar,
  Chip
} from '@mui/material'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import {
  TrendingUp,
  People,
  ShoppingCart,
  AttachMoney,
  Assignment,
  Inventory,
  Work
} from '@mui/icons-material'
import api from '../services/api'

// Colores para gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

function Dashboard() {
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Estados para cada tabla
  const [pedidos, setPedidos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [asignaciones, setAsignaciones] = useState([])
  const [pagos, setPagos] = useState([])
  const [registrosTrabajo, setRegistrosTrabajo] = useState([])

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [pedidosRes, usuariosRes, asignacionesRes, pagosRes, registrosRes] = await Promise.all([
        api.pedidos.getAll(),
        api.usuarios.getAll(),
        api.asignaciones.getAll(),
        api.pagos.getAll(),
        api.registros.getAll()
      ])

      if (!pedidosRes.success) throw new Error(pedidosRes.error)
      if (!usuariosRes.success) throw new Error(usuariosRes.error)
      if (!asignacionesRes.success) throw new Error(asignacionesRes.error)
      if (!pagosRes.success) throw new Error(pagosRes.error)
      if (!registrosRes.success) throw new Error(registrosRes.error)

      setPedidos(pedidosRes.data)
      setUsuarios(usuariosRes.data)
      setAsignaciones(asignacionesRes.data)
      setPagos(pagosRes.data)
      setRegistrosTrabajo(registrosRes.data)

    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // --- Procesamiento de Datos para Gráficos ---

  // 1. Pedidos por Fecha (Últimos 7 días o agrupados)
  const pedidosChartData = useMemo(() => {
    const grouped = pedidos.reduce((acc, curr) => {
      const date = new Date(curr.fecha).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})
    return Object.entries(grouped).map(([name, value]) => ({ name, pedidos: value })).slice(-7)
  }, [pedidos])

  // 2. Usuarios por Rol
  const usuariosRoleData = useMemo(() => {
    const grouped = usuarios.reduce((acc, curr) => {
      const role = curr.rol || 'Sin Rol'
      acc[role] = (acc[role] || 0) + 1
      return acc
    }, {})
    return Object.entries(grouped).map(([name, value]) => ({ name, value }))
  }, [usuarios])

  // 3. Pagos Recientes (Tendencia)
  const pagosChartData = useMemo(() => {
    const sortedPagos = [...pagos].sort((a, b) => new Date(a.fecha_pago) - new Date(b.fecha_pago))
    const grouped = sortedPagos.reduce((acc, curr) => {
      const date = new Date(curr.fecha_pago).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
      acc[date] = (acc[date] || 0) + (Number(curr.monto) || 0)
      return acc
    }, {})
    return Object.entries(grouped).map(([name, monto]) => ({ name, monto })).slice(-10)
  }, [pagos])

  // Colores derivados del theme
  const THEME_COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.info.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main
  ]

  // 4. KPI Cards Data
  const kpiData = [
    {
      title: 'Total Pedidos',
      value: pedidos.length,
      icon: <ShoppingCart sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      bgcolor: theme.palette.primary.light
    },
    {
      title: 'Usuarios Activos',
      value: usuarios.length,
      icon: <People sx={{ fontSize: 40, color: theme.palette.secondary.main }} />,
      bgcolor: theme.palette.secondary.light
    },
    {
      title: 'Asignaciones',
      value: asignaciones.length,
      icon: <Assignment sx={{ fontSize: 40, color: theme.palette.info.main }} />,
      bgcolor: theme.palette.info.light || '#E3F2FD'
    },
    {
      title: 'Total Pagos',
      value: `S/. ${pagos.reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0).toLocaleString()}`,
      icon: <AttachMoney sx={{ fontSize: 40, color: theme.palette.success.main }} />,
      bgcolor: theme.palette.success.light || '#E8F5E9'
    },
  ]

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      </Container>
    )
  }

  return (
    <Container
      maxWidth="xl"
      sx={{
        pb: { xs: 4, sm: 6, md: 8 },
        px: { xs: 2, sm: 3, md: 4 }
      }}
    >
      <Box sx={{
        mt: { xs: 2, sm: 3, md: 4 },
        mb: { xs: 3, sm: 4, md: 6 }
      }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            color: theme.palette.text.primary,
            fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' }
          }}
        >
          Dashboard General
        </Typography>
        <Typography
          variant="subtitle1"
          color="textSecondary"
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          Bienvenido al panel de control. Aquí tienes un resumen de la actividad reciente.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
          Error al cargar datos: {error}
        </Alert>
      )}

      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mb: { xs: 3, sm: 4, md: 6 } }}>
        {kpiData.map((kpi, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card sx={{
              height: '100%',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: theme.shadows[8]
              },
              border: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${kpi.bgcolor}15 100%)`,
              position: 'relative',
              overflow: 'hidden'
            }}>
              <CardContent sx={{
                position: 'relative',
                p: { xs: 2.5, sm: 3, md: 3.5 },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 2
                }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: theme.palette.text.secondary,
                        mb: 1.5,
                        fontWeight: 600,
                        fontSize: { xs: '0.813rem', sm: '0.875rem' },
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {kpi.title}
                    </Typography>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                        lineHeight: 1.2
                      }}
                    >
                      {kpi.value}
                    </Typography>
                  </Box>
                  <Box sx={{
                    p: { xs: 1.5, sm: 2 },
                    bgcolor: kpi.bgcolor,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: `0 4px 12px ${kpi.bgcolor}40`
                  }}>
                    {kpi.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mb: { xs: 3, sm: 4, md: 6 } }}>
        {/* Main Chart: Pagos Trend */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{
            p: { xs: 2, sm: 2.5, md: 3 },
            height: { xs: '300px', sm: '350px', md: '400px' },
            border: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                mb: { xs: 2, sm: 2.5, md: 3 },
                color: theme.palette.text.primary,
                fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' }
              }}
            >
              Tendencia de Pagos e Ingresos
            </Typography>
            <Box sx={{ flexGrow: 1, position: 'relative', minHeight: 0, width: '100%' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={pagosChartData}>
                    <defs>
                      <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      stroke={theme.palette.text.secondary}
                      style={{ fontSize: '0.75rem' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      stroke={theme.palette.text.secondary}
                      style={{ fontSize: '0.75rem' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: theme.shape.borderRadius,
                        border: `1px solid ${theme.palette.divider}`,
                        boxShadow: theme.shadows[3]
                      }}
                    />
                    <Area type="monotone" dataKey="monto" stroke={theme.palette.primary.main} fillOpacity={1} fill="url(#colorMonto)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Box>
          </Paper>
        </Grid>

        {/* Secondary Chart: Usuarios por Rol */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{
            p: { xs: 2, sm: 2.5, md: 3 },
            height: { xs: '300px', sm: '350px', md: '400px' },
            border: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                mb: { xs: 2, sm: 2.5, md: 3 },
                color: theme.palette.text.primary,
                fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' }
              }}
            >
              Distribución de Usuarios
            </Typography>
            <Box sx={{ flexGrow: 1, position: 'relative', minHeight: 0, width: '100%' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={usuariosRoleData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill={theme.palette.primary.main}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {usuariosRoleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={THEME_COLORS[index % THEME_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: theme.shape.borderRadius,
                        border: `1px solid ${theme.palette.divider}`,
                        boxShadow: theme.shadows[3]
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      wrapperStyle={{ fontSize: '0.75rem' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Box>
          </Paper>
        </Grid>

        {/* Third Chart: Pedidos Recientes */}
        <Grid item xs={12}>
          <Paper sx={{
            p: { xs: 2, sm: 2.5, md: 3 },
            height: { xs: '300px', sm: '325px', md: '350px' },
            border: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                mb: { xs: 2, sm: 2.5, md: 3 },
                color: theme.palette.text.primary,
                fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' }
              }}
            >
              Volumen de Pedidos (Últimos 7 días)
            </Typography>
            <Box sx={{ flexGrow: 1, position: 'relative', minHeight: 0, width: '100%' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pedidosChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      stroke={theme.palette.text.secondary}
                      style={{ fontSize: '0.75rem' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      stroke={theme.palette.text.secondary}
                      style={{ fontSize: '0.75rem' }}
                    />
                    <Tooltip
                      cursor={{ fill: theme.palette.action.hover }}
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: theme.shape.borderRadius,
                        border: `1px solid ${theme.palette.divider}`,
                        boxShadow: theme.shadows[3]
                      }}
                    />
                    <Bar
                      dataKey="pedidos"
                      fill={theme.palette.secondary.main}
                      radius={[4, 4, 0, 0]}
                      barSize={50}
                      maxBarSize={60}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Detailed Data Tabs */}
      <Paper elevation={0} sx={{ overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: theme.palette.background.default }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                minHeight: { xs: 48, sm: 56, md: 60 },
                fontSize: { xs: '0.813rem', sm: '0.875rem' },
                px: { xs: 1.5, sm: 2, md: 3 }
              },
              '& .Mui-selected': { color: theme.palette.primary.main }
            }}
          >
            <Tab
              icon={<Inventory fontSize="small" />}
              iconPosition="start"
              label="Pedidos Recientes"
              sx={{ '& .MuiTab-iconWrapper': { display: { xs: 'none', sm: 'inline-flex' } } }}
            />
            <Tab
              icon={<People fontSize="small" />}
              iconPosition="start"
              label="Usuarios"
              sx={{ '& .MuiTab-iconWrapper': { display: { xs: 'none', sm: 'inline-flex' } } }}
            />
            <Tab
              icon={<Assignment fontSize="small" />}
              iconPosition="start"
              label="Asignaciones"
              sx={{ '& .MuiTab-iconWrapper': { display: { xs: 'none', sm: 'inline-flex' } } }}
            />
            <Tab
              icon={<AttachMoney fontSize="small" />}
              iconPosition="start"
              label="Pagos"
              sx={{ '& .MuiTab-iconWrapper': { display: { xs: 'none', sm: 'inline-flex' } } }}
            />
            <Tab
              icon={<Work fontSize="small" />}
              iconPosition="start"
              label="Registros de Trabajo"
              sx={{ '& .MuiTab-iconWrapper': { display: { xs: 'none', sm: 'inline-flex' } } }}
            />
          </Tabs>
        </Box>

        <Box sx={{ p: 0 }}>
          {/* Tab Pedidos */}
          {activeTab === 0 && (
            <TableContainer sx={{ maxHeight: { xs: 400, sm: 450, md: 500 } }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}>Código</TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}>Descripción</TableCell>
                    <TableCell align="center" sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}>Cantidad</TableCell>
                    <TableCell align="center" sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}>Minutos</TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}>Fecha</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pedidos.slice(0, 10).map((pedido) => (
                    <TableRow key={pedido.id_pedido} hover>
                      <TableCell sx={{
                        fontWeight: 'bold',
                        color: theme.palette.text.primary,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}>
                        {pedido.codigo}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {pedido.descripcion}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={pedido.cantidad_total}
                          size="small"
                          sx={{
                            bgcolor: theme.palette.primary.light,
                            color: theme.palette.primary.dark,
                            fontSize: { xs: '0.6875rem', sm: '0.75rem' }
                          }}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {pedido.minutos_total}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {formatDate(pedido.fecha)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {pedidos.length === 0 && (
                    <TableRow><TableCell colSpan={5} align="center">No hay datos</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Tab Usuarios */}
          {activeTab === 1 && (
            <TableContainer sx={{ maxHeight: { xs: 400, sm: 450, md: 500 } }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}>Usuario</TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}>DNI</TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}>Contacto</TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}>Rol</TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}>Registro</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.id_usuario} hover>
                      <TableCell>
                        <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="center">
                          <Avatar sx={{
                            bgcolor: theme.palette.secondary.light,
                            color: theme.palette.secondary.dark,
                            width: { xs: 32, sm: 40 },
                            height: { xs: 32, sm: 40 },
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                          }}>
                            {usuario.nombre?.[0]}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              color="textPrimary"
                              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                            >
                              {usuario.nombre} {usuario.apellidos}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {usuario.dni}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {usuario.celular}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={usuario.rol}
                          size="small"
                          sx={{
                            bgcolor: usuario.rol === 'admin' ? theme.palette.error.light : theme.palette.action.selected,
                            color: usuario.rol === 'admin' ? theme.palette.error.dark : theme.palette.text.primary,
                            fontSize: { xs: '0.6875rem', sm: '0.75rem' }
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {formatDate(usuario.fecha_creacion)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Tab Asignaciones */}
          {activeTab === 2 && (
            <TableContainer sx={{ maxHeight: { xs: 400, sm: 450, md: 500 } }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}>ID Asignación</TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}>Pedido</TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}>Usuario</TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}>Cantidad</TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}>Fecha</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {asignaciones.slice(0, 15).map((asignacion) => (
                    <TableRow key={asignacion.id_asignacion} hover>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {asignacion.id_asignacion}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {asignacion.id_pedido}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {asignacion.id_usuario}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {asignacion.cantidad_asignada}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {formatDate(asignacion.fecha_asignacion)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Tab Pagos */}
          {activeTab === 3 && (
            <TableContainer sx={{ maxHeight: { xs: 400, sm: 450, md: 500 } }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}>Concepto</TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}>Usuario</TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}>Cantidad</TableCell>
                    <TableCell align="right" sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}>Monto</TableCell>
                    <TableCell align="right" sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}>Fecha</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagos.slice(0, 15).map((pago) => (
                    <TableRow key={pago.id_pago} hover>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {pago.concepto}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {pago.id_usuario}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {pago.cantidad}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 'bold',
                          color: theme.palette.success.main,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        S/. {pago.monto}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {formatDate(pago.fecha_pago)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Tab Registros */}
          {activeTab === 4 && (
            <TableContainer sx={{ maxHeight: { xs: 400, sm: 450, md: 500 } }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}>ID Registro</TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}>Asignación</TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}>Trabajado</TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}>Pago</TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' } }}>Fecha</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {registrosTrabajo.slice(0, 15).map((registro) => (
                    <TableRow key={registro.id_registro} hover>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {registro.id_registro}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {registro.id_asignacion}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {registro.cantidad_trabajada}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        S/. {registro.pago}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {formatDate(registro.fecha_registro)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>
    </Container>
  )
}

export default Dashboard
