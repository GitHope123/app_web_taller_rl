import { useState, useEffect, useMemo } from 'react'
import {
    Container,
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Snackbar,
    Alert,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material'
import api from '../services/api'
import DataTable from '../components/DataTable'

function AsignacionEmpleado() {
    const [asignaciones, setAsignaciones] = useState([])
    const [empleados, setEmpleados] = useState([])
    const [pedidos, setPedidos] = useState([])
    const [operaciones, setOperaciones] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Dialog / form state
    const [dialogOpen, setDialogOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({
        id_asignacion: '',
        id_usuario: '',
        id_pedido: '',
        id_operacion_pedido: '',
        cantidad_asignada: '',
    })

    const [filteredOperaciones, setFilteredOperaciones] = useState([])
    const [saving, setSaving] = useState(false)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
    const [errors, setErrors] = useState({})
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [deleteConfirmId, setDeleteConfirmId] = useState(null)
    const [lastActionTime, setLastActionTime] = useState(0)

    const RATE_LIMIT_MS = 1000

    // Función para validar rate limiting
    const checkRateLimit = () => {
        const now = Date.now()
        if (now - lastActionTime < RATE_LIMIT_MS) {
            setSnackbar({ open: true, message: 'Por favor espera un momento antes de realizar otra acción', severity: 'warning' })
            return false
        }
        setLastActionTime(now)
        return true
    }

    // Generador de ID para `id_asignacion` cuando la base de datos lo requiere
    const generateIdAsignacion = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
        return `asignacion_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    }

    // Fetch all data
    const fetchAllData = async () => {
        try {
            setLoading(true)
            const [asRes, empRes, pedRes, opRes] = await Promise.all([
                api.asignaciones.getAll(),
                api.usuarios.getByRol('empleado'),
                api.pedidos.getAll(),
                api.operaciones.getAll(),
            ])

            if (!asRes || asRes.success === false) throw new Error(asRes?.error || 'Error fetching asignaciones')
            if (!empRes || empRes.success === false) throw new Error(empRes?.error || 'Error fetching empleados')
            if (!pedRes || pedRes.success === false) throw new Error(pedRes?.error || 'Error fetching pedidos')
            if (!opRes || opRes.success === false) throw new Error(opRes?.error || 'Error fetching operaciones')

            setAsignaciones(asRes.data || [])
            setEmpleados(empRes.data || [])
            setPedidos(pedRes.data || [])
            setOperaciones(opRes.data || [])
        } catch (err) {
            console.error('Error fetching data:', err)
            setError(err?.message || String(err))
            setAsignaciones([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchAllData() }, [])

    // Create
    const createAsignacion = async (asignacionData) => {
        try {
            const res = await api.asignaciones.create(asignacionData)
            if (!res || res.success === false) return { success: false, error: res?.error || 'Error creating asignacion' }
            return { success: true, data: res.data }
        } catch (err) {
            console.error('Error creating asignacion:', err)
            return { success: false, error: err?.message || String(err) }
        }
    }

    // Update
    const updateAsignacion = async (id, asignacionData) => {
        try {
            const res = await api.asignaciones.update(id, asignacionData)
            if (!res || res.success === false) return { success: false, error: res?.error || 'Error updating asignacion' }
            return { success: true, data: res.data }
        } catch (err) {
            console.error('Error updating asignacion:', err)
            return { success: false, error: err?.message || String(err) }
        }
    }

    // Delete
    const deleteAsignacion = async (id) => {
        try {
            const res = await api.asignaciones.delete(id)
            if (!res || res.success === false) return { success: false, error: res?.error || 'Error deleting asignacion' }
            return { success: true }
        } catch (err) {
            console.error('Error deleting asignacion:', err)
            return { success: false, error: err?.message || String(err) }
        }
    }

    // Helper functions to get names
    const getEmpleadoNombreCompleto = (idUsuario) => {
        const empleado = empleados.find(e => e.id_usuario === idUsuario)
        return empleado ? `${empleado.nombre} ${empleado.apellidos}` : '---'
    }

    const getOperacionDescripcion = (idOperacion) => {
        const operacion = operaciones.find(o => o.id_operacion_pedido === idOperacion)
        return operacion?.nombre_operacion || '---'
    }

    const getCodigoPedido = (idOperacion) => {
        const operacion = operaciones.find(o => o.id_operacion_pedido === idOperacion)
        const pedido = operacion ? pedidos.find(p => p.id_pedido === operacion.id_pedido) : null
        return pedido?.codigo || '---'
    }

    const getSecuenciaOperacion = (idOperacion) => {
        const operacion = operaciones.find(o => o.id_operacion_pedido === idOperacion)
        // La secuencia está en el PEDIDO
        if (operacion) {
            const pedido = pedidos.find(p => p.id_pedido === operacion.id_pedido)
            if (pedido) return pedido.secuencia
        }
        return '---'
    }

    // Columnas para DataTable
    const columns = [
        { id: 'n', label: 'N°', render: (row, index) => index + 1 },
        { id: 'empleado_nombre_completo', label: 'Empleado' },
        { id: 'pedido_codigo_sec', label: 'Pedido (Cód - Sec)' },
        { id: 'operacion_desc', label: 'Operación' },
        { id: 'cantidad_asignada', label: 'Cantidad' },
        { id: 'fecha_formateada', label: 'Fecha de Asignación' },
    ]

    // Preparar datos para la tabla y su buscador
    const tableData = asignaciones.map(a => {
        return {
            ...a,
            empleado_nombre_completo: getEmpleadoNombreCompleto(a.id_usuario),
            pedido_codigo_sec: `${getCodigoPedido(a.id_operacion_pedido)} - ${getSecuenciaOperacion(a.id_operacion_pedido)}`,
            operacion_desc: getOperacionDescripcion(a.id_operacion_pedido),
            fecha_formateada: a.fecha_asignacion ? new Date(a.fecha_asignacion).toLocaleString() : ''
        }
    })

    // Dialog handlers
    const openAdd = () => {
        setIsEditing(false)
        setEditingId(null)
        const now = new Date()
        const fechaNow = now.toISOString().slice(0, 16)
        setFormData({ id_asignacion: '', id_usuario: '', id_pedido: '', id_operacion_pedido: '', cantidad_asignada: '' })
        setFilteredOperaciones([])
        setErrors({})
        setDialogOpen(true)
    }

    const openEdit = (asignacion) => {
        setIsEditing(true)
        setEditingId(asignacion.id_asignacion)
        let fechaVal = asignacion.fecha_asignacion || ''
        try {
            if (fechaVal) {
                const d = new Date(fechaVal)
                if (!isNaN(d)) fechaVal = d.toISOString().slice(0, 16)
            }
        } catch (e) { }

        // Operación ya tiene id_pedido, así que lo obtenemos de allí directamente
        const operacion = operaciones.find(o => o.id_operacion_pedido === asignacion.id_operacion_pedido)
        const pedidoId = operacion ? operacion.id_pedido : ''

        setFormData({
            id_asignacion: asignacion.id_asignacion || '',
            id_usuario: asignacion.id_usuario || '',
            id_pedido: pedidoId,
            id_operacion_pedido: asignacion.id_operacion_pedido || '',
            cantidad_asignada: asignacion.cantidad_asignada || '',
        })

        if (pedidoId) {
            filterOperacionesByPedido(pedidoId)
        }

        setErrors({})
        setDialogOpen(true)
    }

    const closeDialog = () => { setDialogOpen(false) }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

        if (name === 'id_pedido') {
            filterOperacionesByPedido(value)
            // Reset operacion when pedido changes
            setFormData(prev => ({ ...prev, [name]: value, id_operacion_pedido: '' }))
        }
    }

    // Filtrar operaciones por ID de pedido
    const filterOperacionesByPedido = (idPedido) => {
        if (!idPedido) {
            setFilteredOperaciones([])
            return
        }
        const filtered = operaciones.filter(op => String(op.id_pedido) === String(idPedido))
        setFilteredOperaciones(filtered)
    }

    // Helper para mostrar info completa de la operacion en el select
    const getOperationLabel = (op) => {
        return `${op.nombre_operacion} (Tarifa: S/. ${op.tarifa || 0})`
    }

    const handleSave = async () => {
        if (!checkRateLimit()) return
        setSaving(true)

        // Validate
        const newErrors = {}

        if (!formData.id_usuario) newErrors.id_usuario = 'Empleado es requerido'
        if (!formData.id_pedido) newErrors.id_pedido = 'Pedido es requerido'
        if (!formData.id_operacion_pedido) newErrors.id_operacion_pedido = 'Operación es requerida'
        if (!formData.cantidad_asignada || formData.cantidad_asignada <= 0) newErrors.cantidad_asignada = 'Cantidad válida es requerida'

        if (formData.id_pedido) {
            const pedido = pedidos.find(p => p.id_pedido === formData.id_pedido)
            if (pedido && pedido.cantidad_total) {
                if (Number(formData.cantidad_asignada) > Number(pedido.cantidad_total)) {
                    newErrors.cantidad_asignada = `La cantidad no puede superar el total del pedido (${pedido.cantidad_total})`
                }
            }
        }

        setErrors(newErrors)
        if (Object.keys(newErrors).length > 0) {
            setSaving(false)
            setSnackbar({ open: true, message: 'Corrige los errores del formulario', severity: 'error' })
            return
        }

        const payload = {
            id_asignacion: isEditing ? editingId : generateIdAsignacion(),
            id_usuario: formData.id_usuario,
            id_pedido: formData.id_pedido,
            id_operacion_pedido: formData.id_operacion_pedido,
            cantidad_asignada: formData.cantidad_asignada,
        }

        // Fecha de asignación: si estamos creando, fijarla a ahora; si estamos editando, no incluirla
        if (!isEditing) {
            const now = new Date()
            const offset = now.getTimezoneOffset() * 60000
            payload.fecha_asignacion = new Date(now.getTime() - offset).toISOString().slice(0, -1)
        }

        try {
            let res
            if (isEditing && editingId) {
                res = await updateAsignacion(editingId, payload)
            } else {
                res = await createAsignacion(payload)
            }

            if (!res.success) throw new Error(res.error || 'Error en la operación')
            setSnackbar({ open: true, message: 'Guardado correctamente', severity: 'success' })
            closeDialog()
            await fetchAllData()
        } catch (err) {
            console.error(err)
            setSnackbar({ open: true, message: err?.message || 'Error', severity: 'error' })
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id) => {
        if (!checkRateLimit()) return
        const res = await deleteAsignacion(id)
        if (!res.success) {
            setSnackbar({ open: true, message: res.error || 'Error eliminando', severity: 'error' })
            return
        }
        setSnackbar({ open: true, message: 'Asignación eliminada correctamente', severity: 'success' })
        fetchAllData()
    }

    const openDeleteConfirm = (id) => {
        setDeleteConfirmId(id)
        setDeleteConfirmOpen(true)
    }

    const confirmDelete = async () => {
        await handleDelete(deleteConfirmId)
        setDeleteConfirmOpen(false)
    }



    return (
        <Container maxWidth="xl">
            <DataTable
                title="Asignación de Operaciones a Empleados"
                columns={columns}
                data={tableData}
                loading={loading}
                error={error}
                onAdd={openAdd}
                addLabel="Asignar Operación"
                onEdit={(row) => openEdit(row)}
                onDelete={(id) => openDeleteConfirm(id)}
                idField="id_asignacion"
            />

            <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
                <DialogTitle>{isEditing ? 'Editar Asignación' : 'Asignar Operación a Empleado'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
                        <FormControl fullWidth error={!!errors.id_usuario}>
                            <InputLabel>Empleado *</InputLabel>
                            <Select
                                name="id_usuario"
                                value={formData.id_usuario}
                                onChange={handleChange}
                                label="Empleado *"
                            >
                                {empleados.map(emp => (
                                    <MenuItem key={emp.id_usuario} value={emp.id_usuario}>
                                        {emp.nombre} {emp.apellidos}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth error={!!errors.id_pedido}>
                            <InputLabel>Pedido (Codigo - Secuencia) *</InputLabel>
                            <Select
                                name="id_pedido"
                                value={formData.id_pedido}
                                onChange={handleChange}
                                label="Pedido (Codigo - Secuencia) *"
                            >
                                {pedidos.map(p => (
                                    <MenuItem key={p.id_pedido} value={p.id_pedido}>
                                        {p.codigo} - {p.secuencia || '---'}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth error={!!errors.id_operacion_pedido} disabled={!formData.id_pedido}>
                            <InputLabel>Operación *</InputLabel>
                            <Select
                                name="id_operacion_pedido"
                                value={formData.id_operacion_pedido}
                                onChange={handleChange}
                                label="Operación *"
                            >
                                {filteredOperaciones.length === 0 ? (
                                    <MenuItem disabled>
                                        {formData.id_pedido ? 'Sin operaciones disponibles' : 'Seleccione pedido primero'}
                                    </MenuItem>
                                ) : (
                                    filteredOperaciones.map(op => (
                                        <MenuItem key={op.id_operacion_pedido} value={op.id_operacion_pedido}>
                                            {op.nombre_operacion}
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>

                        <TextField
                            name="cantidad_asignada"
                            label="Cantidad Asignada *"
                            type="number"
                            value={formData.cantidad_asignada}
                            onChange={handleChange}
                            error={!!errors.cantidad_asignada}
                            helperText={errors.cantidad_asignada || 'Cantidad de prendas a asignar'}
                            fullWidth
                        />
                        {formData.id_pedido && (
                            <Typography variant="caption" color="textSecondary" sx={{ gridColumn: 'span 2', mt: -1, ml: 1 }}>
                                Max cantidad disponible en pedido: {pedidos.find(p => p.id_pedido === formData.id_pedido)?.cantidad_total || '---'}
                            </Typography>
                        )}


                    </Box>
                    <Typography variant="caption" sx={{ mt: 2, display: 'block', color: 'textSecondary' }}>* Campos requeridos</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>Cancelar</Button>
                    <Button onClick={handleSave} variant="contained" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ backgroundColor: '#ffebee' }}>Confirmar Eliminación</DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Typography>¿Está seguro que desea eliminar esta asignación?</Typography>
                    <Typography variant="body2" color="error" sx={{ mt: 2 }}>Esta acción no se puede deshacer.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>Cancelar</Button>
                    <Button onClick={confirmDelete} variant="contained" color="error">Eliminar</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
                <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
            </Snackbar>
        </Container>
    )
}

export default AsignacionEmpleado
