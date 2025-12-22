import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Tabs,
    Tab,
    Box,
    Typography,
    Divider,
    Chip,
    Stack
} from '@mui/material'
import {
    Inventory as InventoryIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material'
import OrderOperations from './OrderOperations'
import OrderAssignments from './OrderAssignments'
import api from '../../services/api'

function TabPanel(props) {
    const { children, value, index, ...other } = props

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`order-tabpanel-${index}`}
            aria-labelledby={`order-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 2 }}>
                    {children}
                </Box>
            )}
        </div>
    )
}

function OrderDetailsManager({ open, onClose, pedido }) {
    const [tabIndex, setTabIndex] = useState(0)
    const [cantidadDisponible, setCantidadDisponible] = useState(0)

    useEffect(() => {
        if (pedido?.id_pedido && open) {
            calcularCantidadDisponible()
        }
    }, [pedido, open])

    const calcularCantidadDisponible = async () => {
        try {
            // Obtener todas las asignaciones
            const asRes = await api.asignaciones.getAll()
            const allAssignments = asRes.data || []

            // Obtener todas las operaciones del pedido
            const opRes = await api.operaciones.getAll()
            const allOps = opRes.data || []
            const thisOrderOps = allOps.filter(op => op.id_pedido === pedido.id_pedido)
            const thisOrderOpIds = new Set(thisOrderOps.map(op => op.id_operacion_pedido))

            // Filtrar asignaciones de este pedido
            const thisOrderAssignments = allAssignments.filter(a => thisOrderOpIds.has(a.id_operacion_pedido))

            // Calcular total asignado
            const totalAsignado = thisOrderAssignments.reduce((sum, a) => sum + (Number(a.cantidad_asignada) || 0), 0)

            // Calcular disponible
            const disponible = Math.max(0, (pedido.cantidad_total || 0) - totalAsignado)
            setCantidadDisponible(disponible)
        } catch (err) {
            console.error('Error calculando cantidad disponible:', err)
            setCantidadDisponible(pedido.cantidad_total || 0)
        }
    }

    if (!pedido) return null

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue)
        // Recalcular cuando cambiamos de tab (especialmente útil después de hacer cambios)
        if (newValue === 1) {
            calcularCantidadDisponible()
        }
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
            <DialogTitle>
                <Box>
                    <Typography variant="h6">Gestionar Pedido</Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                        <Typography variant="subtitle2" color="textSecondary">
                            Código y secuencia: {pedido.codigo} {pedido.secuencia ? `- ${pedido.secuencia}` : ''} | {pedido.descripcion}
                        </Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <Chip
                            icon={<CheckCircleIcon />}
                            label={`Disponible: ${cantidadDisponible}`}
                            color="success"
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                        />
                        <Chip
                            icon={<InventoryIcon />}
                            label={`Total: ${pedido.cantidad_total || 0}`}
                            color="info"
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                        />
                    </Stack>
                </Box>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 0, minHeight: '500px' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}>
                    <Tabs value={tabIndex} onChange={handleTabChange}>
                        <Tab label="Operaciones" />
                        <Tab label="Asignaciones" />
                    </Tabs>
                </Box>
                <TabPanel value={tabIndex} index={0}>
                    <OrderOperations pedido={pedido} />
                </TabPanel>
                <TabPanel value={tabIndex} index={1}>
                    <OrderAssignments pedido={pedido} onUpdate={calcularCantidadDisponible} />
                </TabPanel>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained">Cerrar</Button>
            </DialogActions>
        </Dialog>
    )
}

export default OrderDetailsManager
