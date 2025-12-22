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
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Settings as SettingsIcon } from '@mui/icons-material'
import OrderDetailsManager from './Pedidos/OrderDetailsManager'
import api from '../services/api' // usar la api para optimizar consultas
import DataTable from '../components/DataTable'
/**
 * Página de Pedidos - CRUD
 * 
 * Conexión a Supabase configurada
 * Tabla: pedido
 * 
 * Operaciones disponibles:
 * - CREATE: Crear nuevo pedido
 * - READ: Listar pedidos
 * - UPDATE: Actualizar pedido
 * - DELETE: Eliminar pedido
 * 
 * TODO: Implementar interfaz CRUD completa
 */

function Pedidos() {
    const [pedidos, setPedidos] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Dialog / form state
    const [dialogOpen, setDialogOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({
        id_pedido: '',
        codigo: '',
        descripcion: '',
        minutos_total: '',
        secuencia: '',
        cantidad_total: '',
        fecha: '',
    })

    const [saving, setSaving] = useState(false)
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
    const [errors, setErrors] = useState({})
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [deleteConfirmId, setDeleteConfirmId] = useState(null)
    const [lastActionTime, setLastActionTime] = useState(0)

    // Manage Order Details State
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [currentPedido, setCurrentPedido] = useState(null)

    // Constantes de validación
    const MAX_CODIGO_LENGTH = 50
    const MAX_DESC_LENGTH = 200
    const MAX_MINUTOS = 99999
    const MAX_SECUENCIA = 9999
    const MAX_CANTIDAD = 999999
    const RATE_LIMIT_MS = 1000 // 1 segundo entre acciones

    // Función para sanitizar entrada de texto
    const sanitizeText = (text, maxLength) => {
        if (!text) return ''
        // Remover caracteres de control y limitar longitud
        return text.slice(0, maxLength).replace(/[<>\"'%;()&+]/g, '')
    }

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

    // Generador de ID para `id_pedido` cuando la base de datos lo requiere
    const generateIdPedido = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
        // Fallback a una cadena pseudo-única
        return `pedido_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    }

    // Fetch
    const fetchPedidos = async () => {
        try {
            setLoading(true)
            const res = await api.pedidos.getAll()
            if (!res || res.success === false) throw new Error(res?.error || 'Error fetching pedidos')
            setPedidos(res.data || [])
        } catch (err) {
            console.error('Error fetching pedidos:', err)
            setError(err?.message || String(err))
            setPedidos([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchPedidos() }, [])

    // Create
    const createPedido = async (pedidoData) => {
        try {
            const res = await api.pedidos.create(pedidoData)
            if (!res || res.success === false) return { success: false, error: res?.error || 'Error creating pedido' }
            return { success: true, data: res.data }
        } catch (err) {
            console.error('Error creating pedido:', err)
            return { success: false, error: err?.message || String(err) }
        }
    }

    // Update
    const updatePedido = async (id, pedidoData) => {
        try {
            const res = await api.pedidos.update(id, pedidoData)
            if (!res || res.success === false) return { success: false, error: res?.error || 'Error updating pedido' }
            return { success: true, data: res.data }
        } catch (err) {
            console.error('Error updating pedido:', err)
            return { success: false, error: err?.message || String(err) }
        }
    }

    // Delete
    const deletePedido = async (id) => {
        try {
            const res = await api.pedidos.delete(id)
            if (!res || res.success === false) return { success: false, error: res?.error || 'Error deleting pedido' }
            return { success: true }
        } catch (err) {
            console.error('Error deleting pedido:', err)
            return { success: false, error: err?.message || String(err) }
        }
    }



    // Columnas para DataTable
    const columns = [
        { id: 'n', label: 'N°', render: (row, index) => index + 1 },
        { id: 'codigo', label: 'Código' },
        { id: 'descripcion', label: 'Descripción' },
        { id: 'minutos_total', label: 'Minutos', align: 'right' },
        { id: 'secuencia', label: 'Secuencia', align: 'right' },
        { id: 'cantidad_total', label: 'Cantidad', align: 'right' },
        { id: 'fecha_formateada', label: 'Fecha de creación' },
    ]

    // Preparar datos
    const tableData = pedidos.map(p => ({
        ...p,
        fecha_formateada: p.fecha ? new Date(p.fecha).toLocaleString() : ''
    }))

    // Dialog handlers
    const openAdd = () => {
        setIsEditing(false)
        setEditingId(null)
        const now = new Date()
        const offset = now.getTimezoneOffset() * 60000
        const fechaNow = new Date(now.getTime() - offset).toISOString().slice(0, 16)
        setFormData({ id_pedido: '', codigo: '', descripcion: '', minutos_total: '', secuencia: '', cantidad_total: '', fecha: fechaNow })
        setErrors({})
        setDialogOpen(true)
    }

    const openEdit = (pedido) => {
        setIsEditing(true)
        setEditingId(pedido.id_pedido)
        // Convert fecha to datetime-local compatible if possible
        let fechaVal = pedido.fecha || ''
        try {
            if (fechaVal) {
                const d = new Date(fechaVal)
                if (!isNaN(d)) {
                    const offset = d.getTimezoneOffset() * 60000
                    fechaVal = new Date(d.getTime() - offset).toISOString().slice(0, 16)
                }
            }
        } catch (e) { }
        setFormData({
            id_pedido: pedido.id_pedido || '',
            codigo: pedido.codigo || '',
            descripcion: pedido.descripcion || '',
            minutos_total: pedido.minutos_total ?? '',
            secuencia: pedido.secuencia ?? '',
            cantidad_total: pedido.cantidad_total ?? '',
            fecha: fechaVal,
        })
        setErrors({})
        setDialogOpen(true)
    }

    const closeDialog = () => { setDialogOpen(false) }

    const handleChange = (e) => {
        const { name, value } = e.target
        let sanitizedValue = value

        // Sanitizar campos de texto
        if (name === 'codigo') sanitizedValue = sanitizeText(value, MAX_CODIGO_LENGTH)
        if (name === 'descripcion') sanitizedValue = sanitizeText(value, MAX_DESC_LENGTH)

        setFormData(prev => ({ ...prev, [name]: sanitizedValue }))
    }

    const handleSave = async () => {
        if (!checkRateLimit()) return
        setSaving(true)
        // Validate
        const newErrors = {}
        const mt = formData.minutos_total
        const seq = formData.secuencia
        const cant = formData.cantidad_total


        if (mt === '' || mt === null || mt === undefined) newErrors.minutos_total = 'Minutos es requerido'
        else if (!Number.isFinite(Number(mt))) newErrors.minutos_total = 'Minutos debe ser un número'
        else if (Number(mt) < 0) newErrors.minutos_total = 'Minutos no puede ser negativo'
        else if (Number(mt) > MAX_MINUTOS) newErrors.minutos_total = `Minutos no puede exceder ${MAX_MINUTOS}`

        if (seq === '' || seq === null || seq === undefined) newErrors.secuencia = 'Secuencia es requerida'
        else if (!Number.isInteger(Number(seq))) newErrors.secuencia = 'Secuencia debe ser un entero'
        else if (Number(seq) < 0) newErrors.secuencia = 'Secuencia no puede ser negativa'
        else if (Number(seq) > MAX_SECUENCIA) newErrors.secuencia = `Secuencia no puede exceder ${MAX_SECUENCIA}`

        if (cant === '' || cant === null || cant === undefined) newErrors.cantidad_total = 'Cantidad es requerida'
        else if (!Number.isInteger(Number(cant))) newErrors.cantidad_total = 'Cantidad debe ser un entero'
        else if (Number(cant) < 0) newErrors.cantidad_total = 'Cantidad no puede ser negativa'
        else if (Number(cant) > MAX_CANTIDAD) newErrors.cantidad_total = `Cantidad no puede exceder ${MAX_CANTIDAD}`

        // La fecha de creación se asigna automáticamente al crear y no puede editarse, por lo que no validamos aquí.

        setErrors(newErrors)
        if (Object.keys(newErrors).length > 0) {
            setSaving(false)
            setSnackbar({ open: true, message: 'Corrige los errores del formulario', severity: 'error' })
            return
        }
        // Basic normalization: convert numeric fields
        const payload = {
            // exclude id_pedido from payload (not registered/viewable by user)
            codigo: formData.codigo,
            descripcion: formData.descripcion,
            minutos_total: formData.minutos_total === '' ? null : Number(formData.minutos_total),
            secuencia: formData.secuencia === '' ? null : Number(formData.secuencia),
            cantidad_total: formData.cantidad_total === '' ? null : Number(formData.cantidad_total),
        }

        // Fecha de creación: si estamos creando, fijarla a ahora; si estamos editando, no incluirla (no es modificable)
        if (!isEditing) {
            const now = new Date()
            const offset = now.getTimezoneOffset() * 60000
            payload.fecha = new Date(now.getTime() - offset).toISOString().slice(0, -1)
        }

        try {
            let res
            if (isEditing && editingId) {
                // Validar que la nueva cantidad total no sea menor a lo ya asignado
                try {
                    const [opsRes, asgsRes] = await Promise.all([
                        api.operaciones.getAll(),
                        api.asignaciones.getAll()
                    ])

                    if (opsRes.success && asgsRes.success) {
                        const orderOps = opsRes.data.filter(op => op.id_pedido === editingId)
                        const orderOpIds = new Set(orderOps.map(op => op.id_operacion_pedido))
                        const orderAssigns = asgsRes.data.filter(a => orderOpIds.has(a.id_operacion_pedido))

                        // Agrupar por operación para validar independientemente
                        const sumsByOp = {}
                        orderAssigns.forEach(a => {
                            sumsByOp[a.id_operacion_pedido] = (sumsByOp[a.id_operacion_pedido] || 0) + (Number(a.cantidad_asignada) || 0)
                        })

                        // El pedido no puede ser menor que la mayor asignación de cualquiera de sus operaciones
                        const maxAssigned = Math.max(0, ...Object.values(sumsByOp))

                        if (Number(payload.cantidad_total) < maxAssigned) {
                            setErrors(prev => ({ ...prev, cantidad_total: `Mínimo permitido: ${maxAssigned} (ya asignado en una operación)` }))
                            setSnackbar({ open: true, message: `No puedes reducir la cantidad a menos de lo ya asignado (${maxAssigned})`, severity: 'error' })
                            setSaving(false)
                            return
                        }
                    }
                } catch (e) {
                    console.error('Error validando asignaciones:', e)
                }

                res = await updatePedido(editingId, payload)
            } else {
                // Si la BD requiere `id_pedido` NOT NULL, generarlo cliente-side
                payload.id_pedido = generateIdPedido()
                res = await createPedido(payload)
            }

            if (!res.success) throw new Error(res.error || 'Error en la operación')
            setSnackbar({ open: true, message: 'Guardado correctamente', severity: 'success' })
            closeDialog()
            await fetchPedidos()
        } catch (err) {
            console.error(err)
            setSnackbar({ open: true, message: err?.message || 'Error', severity: 'error' })
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id) => {
        if (!checkRateLimit()) return
        const res = await deletePedido(id)
        if (!res.success) {
            setSnackbar({ open: true, message: res.error || 'Error eliminando', severity: 'error' })
            return
        }
        setSnackbar({ open: true, message: 'Pedido eliminado correctamente', severity: 'success' })
        fetchPedidos()
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
                title="Gestión de Pedidos"
                columns={columns}
                data={tableData}
                loading={loading}
                error={error}
                onAdd={openAdd}
                addLabel="Agregar Pedido"
                onEdit={(row) => openEdit(row)}
                onDelete={(id) => openDeleteConfirm(id)}
                idField="id_pedido"
                customActions={(row) => (
                    <IconButton
                        size="small"
                        color="warning"
                        onClick={() => {
                            setCurrentPedido(row)
                            setDetailsOpen(true)
                        }}
                        title="Gestionar (Operaciones y Asignaciones)"
                    >
                        <SettingsIcon fontSize="small" />
                    </IconButton>
                )}
            />

            <OrderDetailsManager
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                pedido={currentPedido}
            />
            {/* Table wrapper and manual rendering removed in favor of DataTable */}

            <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
                <DialogTitle>{isEditing ? 'Editar Pedido' : 'Agregar Pedido'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
                        <TextField name="codigo" label="Código *" placeholder="Ej: PED-001" value={formData.codigo} onChange={handleChange} inputProps={{ maxLength: MAX_CODIGO_LENGTH }} helperText={`${formData.codigo.length}/${MAX_CODIGO_LENGTH}`} />
                        <TextField name="descripcion" label="Descripción *" placeholder="Descripción del pedido" value={formData.descripcion} onChange={handleChange} inputProps={{ maxLength: MAX_DESC_LENGTH }} helperText={`${formData.descripcion.length}/${MAX_DESC_LENGTH}`} />
                        <TextField name="minutos_total" label="Minutos Total *" type="number" value={formData.minutos_total} onChange={handleChange} error={!!errors.minutos_total} helperText={errors.minutos_total || `Máx: ${MAX_MINUTOS}`} inputProps={{ max: MAX_MINUTOS }} />
                        <TextField name="secuencia" label="Secuencia *" type="number" value={formData.secuencia} onChange={handleChange} error={!!errors.secuencia} helperText={errors.secuencia || `Máx: ${MAX_SECUENCIA}`} inputProps={{ max: MAX_SECUENCIA }} />
                        <TextField name="cantidad_total" label="Cantidad Total *" type="number" value={formData.cantidad_total} onChange={handleChange} error={!!errors.cantidad_total} helperText={errors.cantidad_total || `Máx: ${MAX_CANTIDAD}`} inputProps={{ max: MAX_CANTIDAD }} />
                        <TextField name="fecha" label="Fecha de creación" type="datetime-local" value={formData.fecha} InputLabelProps={{ shrink: true }} disabled helperText="Autogenerada al crear; no editable" />
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
                    <Typography>¿Está seguro que desea eliminar este pedido?</Typography>
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
            {/* Developer info removed per request */}
        </Container>
    )
}

export default Pedidos
