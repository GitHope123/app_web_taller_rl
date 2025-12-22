import { useState, useEffect } from 'react'
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormHelperText,
    CircularProgress,
    Snackbar,
    Alert,
    IconButton,
    Typography,
    Chip
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material'
import api from '../../services/api'
import DataTable from '../../components/DataTable'
import ConfirmDialog from '../../components/ConfirmDialog'

function OrderOperations({ pedido }) {
    const [operaciones, setOperaciones] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Form states
    const [openDialog, setOpenDialog] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        id_operacion_pedido: '',
        nombre_operacion: '',
        minutos_unidad: ''
    })
    const [fieldErrors, setFieldErrors] = useState({})

    // Notifications
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [deleteId, setDeleteId] = useState(null)

    useEffect(() => {
        if (pedido?.id_pedido) {
            fetchOperaciones()
        }
    }, [pedido])

    const fetchOperaciones = async () => {
        try {
            setLoading(true)
            const { success, data } = await api.operaciones.getAll()
            if (success) {
                // Filter client-side for this pedido
                const filtered = (data || []).filter(op => op.id_pedido === pedido.id_pedido)
                setOperaciones(filtered)
            } else {
                setError('Error cargando operaciones')
            }
        } catch (err) {
            console.error(err)
            setError('No se pudieron cargar las operaciones')
        } finally {
            setLoading(false)
        }
    }

    const validateField = (name, value) => {
        const errors = { ...fieldErrors }
        if (name === 'nombre_operacion') {
            if (!value) errors.nombre_operacion = 'Campo requerido'
            else delete errors.nombre_operacion
        }
        if (name === 'minutos_unidad') {
            if (value && (isNaN(value) || parseFloat(value) < 0)) errors.minutos_unidad = 'Debe ser # válido'
            else delete errors.minutos_unidad
        }
        setFieldErrors(errors)
    }

    const handleOpenCreate = () => {
        // Using timestamp-based ID to avoid collisions across all pedidos
        // Backend should handle final ID assignment if needed
        setFormData({
            id_operacion_pedido: `OPP${Date.now().toString().slice(-6)}`,
            nombre_operacion: '',
            minutos_unidad: ''
        })
        setFieldErrors({})
        setIsEditing(false)
        setOpenDialog(true)
    }

    const handleOpenEdit = (op) => {
        setFormData({
            id_operacion_pedido: op.id_operacion_pedido,
            nombre_operacion: op.nombre_operacion,
            minutos_unidad: op.minutos_unidad
        })
        setFieldErrors({})
        setIsEditing(true)
        setOpenDialog(true)
    }

    const handleSave = async () => {
        // Validate
        if (!formData.nombre_operacion) {
            setFieldErrors({ nombre_operacion: 'Requerido' })
            return
        }

        const payload = {
            ...formData,
            id_pedido: pedido.id_pedido, // Force association
            minutos_unidad: parseFloat(formData.minutos_unidad) || 0
        }

        try {
            let res
            if (isEditing) {
                res = await api.operaciones.update(formData.id_operacion_pedido, payload)
            } else {
                res = await api.operaciones.create(payload)
            }

            if (res.success) {
                setSnackbar({ open: true, message: isEditing ? 'Actualizado' : 'Creado', severity: 'success' })
                setOpenDialog(false)
                fetchOperaciones()
            } else {
                setSnackbar({ open: true, message: res.error || 'Error', severity: 'error' })
            }
        } catch (e) {
            setSnackbar({ open: true, message: 'Error de red', severity: 'error' })
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return
        const res = await api.operaciones.delete(deleteId)
        if (res.success) {
            setSnackbar({ open: true, message: 'Eliminado', severity: 'success' })
            fetchOperaciones()
        } else {
            setSnackbar({ open: true, message: 'Error al eliminar', severity: 'error' })
        }
        setConfirmOpen(false)
    }

    const columns = [
        { id: 'n', label: 'N°', render: (_, i) => i + 1 },
        { id: 'nombre_operacion', label: 'Nombre' },
        { id: 'minutos_unidad', label: 'Min/Unidad' },
    ]

    return (
        <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Operaciones del Pedido</Typography>
            </Box>

            <DataTable
                noCard // To blend into the modal
                columns={columns}
                data={operaciones}
                loading={loading}
                onAdd={handleOpenCreate}
                addLabel="Nueva Operación"
                onEdit={handleOpenEdit}
                onDelete={(id) => { setDeleteId(id); setConfirmOpen(true); }}
                idField="id_operacion_pedido"
            />

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{isEditing ? 'Editar Operación' : 'Nueva Operación'}</DialogTitle>
                <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Nombre Operación"
                        name="nombre_operacion"
                        value={formData.nombre_operacion}
                        onChange={(e) => setFormData({ ...formData, nombre_operacion: e.target.value })}
                        error={!!fieldErrors.nombre_operacion}
                        helperText={fieldErrors.nombre_operacion}
                        fullWidth
                    />
                    <TextField
                        label="Minutos por Unidad"
                        name="minutos_unidad"
                        type="number"
                        value={formData.minutos_unidad}
                        onChange={(e) => setFormData({ ...formData, minutos_unidad: e.target.value })}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
                    <Button onClick={handleSave} variant="contained">{isEditing ? 'Actualizar' : 'Crear'}</Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog
                open={confirmOpen}
                title="Eliminar Operación"
                content="¿Eliminar esta operación?"
                onConfirm={handleDelete}
                onCancel={() => setConfirmOpen(false)}
            />

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    )
}

export default OrderOperations
