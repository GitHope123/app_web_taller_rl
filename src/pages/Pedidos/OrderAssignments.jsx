import { useState, useEffect } from 'react'
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Snackbar,
    Alert,
    Typography
} from '@mui/material'
import api from '../../services/api'
import DataTable from '../../components/DataTable'
import ConfirmDialog from '../../components/ConfirmDialog'

function OrderAssignments({ pedido, onUpdate }) {
    const [assignments, setAssignments] = useState([])
    const [employees, setEmployees] = useState([])
    const [operations, setOperations] = useState([]) // Only ops for this order
    const [loading, setLoading] = useState(false)

    // Form
    const [openDialog, setOpenDialog] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        id_asignacion: '',
        id_usuario: '',
        id_operacion_pedido: '',
        cantidad_asignada: ''
    })
    const [errors, setErrors] = useState({})

    // Confirm/Toast
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
    const [deleteId, setDeleteId] = useState(null)

    useEffect(() => {
        if (pedido?.id_pedido) {
            fetchAllData()
        }
    }, [pedido])

    const fetchAllData = async () => {
        setLoading(true)
        try {
            const [asRes, empRes, opRes] = await Promise.all([
                api.asignaciones.getAll(),
                api.usuarios.getByRol('empleado'),
                api.operaciones.getAll() // optimizations needed in future api
            ])

            // Filter assignments for this pedido
            // Assignments link to operation -> operation links to pedido.
            // So we need to match via operation.

            const allOps = opRes.data || []
            const thisOrderOps = allOps.filter(op => op.id_pedido === pedido.id_pedido)
            setOperations(thisOrderOps)

            const thisOrderOpIds = new Set(thisOrderOps.map(op => op.id_operacion_pedido))

            const allAssigns = asRes.data || []
            const thisOrderAssigns = allAssigns.filter(a => thisOrderOpIds.has(a.id_operacion_pedido))

            setAssignments(thisOrderAssigns)
            setEmployees(empRes.data || [])

        } catch (err) {
            console.error(err)
            setSnackbar({ open: true, message: 'Error cargando datos', severity: 'error' })
        } finally {
            setLoading(false)
        }
    }

    const handleOpenAdd = () => {
        setFormData({
            id_asignacion: `ASG${Date.now()}`,
            id_usuario: '',
            id_operacion_pedido: '',
            cantidad_asignada: ''
        })
        setErrors({})
        setIsEditing(false)
        setOpenDialog(true)
    }

    const handleOpenEdit = (row) => {
        setFormData(row)
        setErrors({})
        setIsEditing(true)
        setOpenDialog(true)
    }

    const handleSave = async () => {
        const newErrors = {}
        if (!formData.id_usuario) newErrors.id_usuario = 'Requerido'
        if (!formData.id_operacion_pedido) newErrors.id_operacion_pedido = 'Requerido'
        if (!formData.cantidad_asignada) newErrors.cantidad_asignada = 'Requerido'
        else if (Number(formData.cantidad_asignada) <= 0) newErrors.cantidad_asignada = 'La cantidad debe ser mayor a 0'

        const currentQty = Number(formData.cantidad_asignada)

        // Validar que la suma TOTAL de asignaciones (de TODAS las operaciones) no supere la cantidad del pedido
        // El usuario especificó que la "cantidad total de asignacion" no supere la del pedido.
        const otherAssignments = isEditing
            ? assignments.filter(a => a.id_asignacion !== formData.id_asignacion)
            : assignments

        const totalAssignedGlobal = otherAssignments.reduce((sum, a) => sum + (Number(a.cantidad_asignada) || 0), 0)

        if (currentQty + totalAssignedGlobal > pedido.cantidad_total) {
            const restante = Math.max(0, pedido.cantidad_total - totalAssignedGlobal)
            newErrors.cantidad_asignada = `Excede el total disponible del pedido. Disponible: ${restante}`
        }

        setErrors(newErrors)
        if (Object.keys(newErrors).length > 0) return

        const payload = {
            ...formData,
            id_pedido: pedido.id_pedido, // Redundant but good for tracking if db supports
            cantidad_asignada: Number(formData.cantidad_asignada)
        }
        if (!isEditing) {
            const now = new Date()
            const offset = now.getTimezoneOffset() * 60000
            payload.fecha_asignacion = new Date(now.getTime() - offset).toISOString().slice(0, -1)
        }

        try {
            let res
            if (isEditing) res = await api.asignaciones.update(formData.id_asignacion, payload)
            else res = await api.asignaciones.create(payload)

            if (res.success) {
                setSnackbar({ open: true, message: 'Guardado', severity: 'success' })
                setOpenDialog(false)
                fetchAllData()
                if (onUpdate) onUpdate() // Notificar al padre para actualizar cantidad disponible
            } else {
                setSnackbar({ open: true, message: res.error || 'Error', severity: 'error' })
            }
        } catch (e) {
            setSnackbar({ open: true, message: 'Error de red', severity: 'error' })
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return
        const res = await api.asignaciones.delete(deleteId)
        if (res.success) {
            setSnackbar({ open: true, message: 'Eliminado', severity: 'success' })
            fetchAllData()
            if (onUpdate) onUpdate() // Notificar al padre para actualizar cantidad disponible
        } else {
            // Verificar si es error de llave foránea (23503)
            // La estructura del error puede variar dependiendo de cómo lo devuelva api.js,
            // pero comúnmente en Supabase/Postgres viene en details o code.
            const errorMsg = typeof res.error === 'object' ? JSON.stringify(res.error) : String(res.error)

            if (errorMsg.includes('23503') || errorMsg.includes('foreign key constraint')) {
                setSnackbar({
                    open: true,
                    message: 'No se puede eliminar: Hay registros de trabajo asociados a esta asignación.',
                    severity: 'warning'
                })
            } else {
                setSnackbar({ open: true, message: res.error || 'Error al eliminar', severity: 'error' })
            }
        }
        setConfirmDeleteOpen(false)
    }

    const getEmpName = (id) => {
        const e = employees.find(x => x.id_usuario === id)
        return e ? `${e.nombre} ${e.apellidos}` : id
    }
    const getOpName = (id) => {
        const o = operations.find(x => x.id_operacion_pedido === id)
        return o ? o.nombre_operacion : id
    }

    const columns = [
        { id: 'n', label: 'N°', render: (_, i) => i + 1 },
        { id: 'id_usuario', label: 'Empleado', render: (row) => getEmpName(row.id_usuario) },
        { id: 'id_operacion_pedido', label: 'Operación', render: (row) => getOpName(row.id_operacion_pedido) },
        { id: 'cantidad_asignada', label: 'Cantidad' },
    ]

    return (
        <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Asignaciones del Pedido</Typography>
            </Box>

            <DataTable
                noCard
                columns={columns}
                data={assignments}
                loading={loading}
                onAdd={handleOpenAdd}
                addLabel="Asignar Empleado"
                onEdit={handleOpenEdit}
                onDelete={(id) => { setDeleteId(id); setConfirmDeleteOpen(true); }}
                idField="id_asignacion"
            />

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{isEditing ? 'Editar Asignación' : 'Nueva Asignación'}</DialogTitle>
                <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth error={!!errors.id_usuario}>
                        <InputLabel>Empleado</InputLabel>
                        <Select
                            value={formData.id_usuario}
                            label="Empleado"
                            onChange={(e) => setFormData({ ...formData, id_usuario: e.target.value })}
                        >
                            {employees.map(e => (
                                <MenuItem key={e.id_usuario} value={e.id_usuario}>{e.nombre} {e.apellidos}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth error={!!errors.id_operacion_pedido}>
                        <InputLabel>Operación</InputLabel>
                        <Select
                            value={formData.id_operacion_pedido}
                            label="Operación"
                            onChange={(e) => setFormData({ ...formData, id_operacion_pedido: e.target.value })}
                        >
                            {operations.map(o => (
                                <MenuItem key={o.id_operacion_pedido} value={o.id_operacion_pedido}>{o.nombre_operacion}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label="Cantidad Asignada"
                        type="number"
                        value={formData.cantidad_asignada}
                        onChange={(e) => setFormData({ ...formData, cantidad_asignada: e.target.value })}
                        error={!!errors.cantidad_asignada}
                        helperText={errors.cantidad_asignada}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
                    <Button onClick={handleSave} variant="contained">Guardar</Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog
                open={confirmDeleteOpen}
                title="Eliminar Asignación"
                content="¿Eliminar esta asignación?"
                onConfirm={handleDelete}
                onCancel={() => setConfirmDeleteOpen(false)}
            />

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    )
}

export default OrderAssignments
