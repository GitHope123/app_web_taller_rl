import { useState, useEffect } from 'react'
import {
    Container,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Snackbar,
    Alert,
    Box,
    Chip
} from '@mui/material'
import api from '../services/api'
import DataTable from '../components/DataTable'
import ConfirmDialog from '../components/ConfirmDialog'

function Operaciones() {
    const [operaciones, setOperaciones] = useState([])
    const [pedidos, setPedidos] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Filters
    const [pedidoFilter, setPedidoFilter] = useState('')

    // Form and Dialog states
    const [openDialog, setOpenDialog] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        id_operacion_pedido: '',
        id_pedido: '',
        nombre_operacion: '',
        minutos_unidad: ''
    })
    const [fieldErrors, setFieldErrors] = useState({})

    // Notification states
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [deleteId, setDeleteId] = useState(null)

    // Validar si contiene símbolos raros
    const hasSpecialCharacters = (text) => {
        const specialCharsRegex = /[<>{}[\]\\^`|~]/g
        return specialCharsRegex.test(text)
    }

    // Validar campos individuales
    const validateField = (name, value) => {
        const errors = { ...fieldErrors }

        if (name === 'nombre_operacion') {
            if (!value) {
                errors.nombre_operacion = 'Campo requerido'
            } else if (hasSpecialCharacters(value)) {
                errors.nombre_operacion = 'No se permiten símbolos raros'
            } else {
                delete errors.nombre_operacion
            }
        }

        if (name === 'minutos_unidad') {
            if (value && (isNaN(value) || parseFloat(value) < 0)) {
                errors.minutos_unidad = 'Debe ser un número válido'
            } else {
                delete errors.minutos_unidad
            }
        }

        setFieldErrors(errors)
    }

    // Obtener operaciones
    const fetchOperaciones = async () => {
        try {
            setLoading(true)
            const { success, data } = await api.operaciones.getAll()
            if (success) {
                setOperaciones(data || [])
            } else {
                setError('Error cargando operaciones')
            }
        } catch (err) {
            console.error('Error:', err)
            setError('No se pudieron cargar las operaciones')
        } finally {
            setLoading(false)
        }
    }

    // Obtener pedidos
    const fetchPedidos = async () => {
        try {
            const { success, data } = await api.pedidos.getAll()
            if (success) {
                setPedidos(data || [])
            }
        } catch (err) {
            console.error('Error:', err)
        }
    }

    useEffect(() => {
        fetchOperaciones()
        fetchPedidos()
    }, [])

    // Helpers para ID
    const extractNumber = (id) => {
        const match = id.match(/\d+$/)
        return match ? parseInt(match[0], 10) : 0
    }

    const getNextId = () => {
        if (operaciones.length === 0) return 'OPP001'
        const max = Math.max(...operaciones.map(op => extractNumber(op.id_operacion_pedido)))
        return `OPP${String(max + 1).padStart(3, '0')}`
    }

    // Color generator for chips
    const getChipColor = (str) => {
        const colors = [
            '#1976d2', // Blue
            '#d32f2f', // Red
            '#2e7d32', // Green
            '#ed6c02', // Orange
            '#9c27b0', // Purple
            '#0288d1', // Light Blue
            '#e91e63', // Pink
            '#009688', // Teal
        ]
        let hash = 0
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash)
        }
        return colors[Math.abs(hash) % colors.length]
    }

    // CRUD Handlers
    const handleCreate = async () => {
        validateField('nombre_operacion', formData.nombre_operacion)
        validateField('minutos_unidad', formData.minutos_unidad)

        if (Object.keys(fieldErrors).length > 0) {
            setSnackbar({ open: true, message: 'Por favor corrige los errores en los campos', severity: 'error' })
            return
        }

        if (!formData.id_pedido || !formData.nombre_operacion) {
            setSnackbar({ open: true, message: 'Los campos Pedido y Nombre son requeridos', severity: 'error' })
            return
        }

        try {
            const { success } = await api.operaciones.create({
                ...formData,
                minutos_unidad: parseFloat(formData.minutos_unidad)
            })
            if (success) {
                setOpenDialog(false)
                setFormData({ id_operacion_pedido: '', id_pedido: '', nombre_operacion: '', minutos_unidad: '' })
                setFieldErrors({})
                setSnackbar({ open: true, message: 'Operación creada correctamente', severity: 'success' })
                fetchOperaciones()
            }
        } catch (err) {
            setSnackbar({ open: true, message: 'Error al crear', severity: 'error' })
        }
    }

    const handleEdit = async () => {
        validateField('nombre_operacion', formData.nombre_operacion)
        validateField('minutos_unidad', formData.minutos_unidad)

        if (Object.keys(fieldErrors).length > 0) {
            setSnackbar({ open: true, message: 'Por favor corrige los errores en los campos', severity: 'error' })
            return
        }

        if (!formData.id_pedido || !formData.nombre_operacion) {
            setSnackbar({ open: true, message: 'Los campos Pedido y Nombre son requeridos', severity: 'error' })
            return
        }

        try {
            const { success } = await api.operaciones.update(formData.id_operacion_pedido, {
                id_pedido: formData.id_pedido,
                nombre_operacion: formData.nombre_operacion,
                minutos_unidad: parseFloat(formData.minutos_unidad)
            })
            if (success) {
                setOpenDialog(false)
                setIsEditing(false)
                setFormData({ id_operacion_pedido: '', id_pedido: '', nombre_operacion: '', minutos_unidad: '' })
                setFieldErrors({})
                setSnackbar({ open: true, message: 'Operación actualizada correctamente', severity: 'success' })
                fetchOperaciones()
            }
        } catch (err) {
            setSnackbar({ open: true, message: 'Error al actualizar', severity: 'error' })
        }
    }

    const handleDeleteClick = (id) => {
        setDeleteId(id)
        setConfirmOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!deleteId) return
        setConfirmOpen(false)

        try {
            const { success } = await api.operaciones.delete(deleteId)
            if (success) {
                setSnackbar({ open: true, message: 'Operación eliminada correctamente', severity: 'success' })
                fetchOperaciones()
            } else {
                setSnackbar({ open: true, message: 'Error al eliminar', severity: 'error' })
            }
        } catch (err) {
            setSnackbar({ open: true, message: 'Error al eliminar', severity: 'error' })
        } finally {
            setDeleteId(null)
        }
    }

    const handleOpenCreate = () => {
        const newId = getNextId()
        setFormData({ id_operacion_pedido: newId, id_pedido: '', nombre_operacion: '', minutos_unidad: '' })
        setFieldErrors({})
        setError(null)
        setIsEditing(false)
        setOpenDialog(true)
    }

    const handleOpenEdit = (op) => {
        // Excluimos descripción si viniera en el objeto op
        const { descripcion_operacion, ...cleanOp } = op
        setFormData(cleanOp)
        setFieldErrors({})
        setError(null)
        setIsEditing(true)
        setOpenDialog(true)
    }

    const handleFormChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
        validateField(name, value)
    }

    // Validar y preparar datos para la tabla
    const tableData = operaciones.map(op => {
        const pedido = pedidos.find(p => p.id_pedido === op.id_pedido)
        const codigoLabel = pedido
            ? `${pedido.codigo}${pedido.secuencia ? '-' + pedido.secuencia : ''}`
            : op.id_pedido
        return {
            ...op,
            codigo_secuencia_derived: codigoLabel,
            descripcion_pedido_derived: pedido ? pedido.descripcion : '-'
        }
    })

    // Aplicar Filtro
    const filteredData = pedidoFilter
        ? tableData.filter(d => d.id_pedido === pedidoFilter)
        : tableData

    // Componente de Filtro Dropdown
    const FilterComponent = (
        <FormControl size="small" sx={{ minWidth: 350 }}>
            <InputLabel>Filtrar por Código - Secuencia</InputLabel>
            <Select
                value={pedidoFilter}
                label="Filtrar por Código - Secuencia"
                onChange={(e) => setPedidoFilter(e.target.value)}
            >
                <MenuItem value="">
                    <em>Todos</em>
                </MenuItem>
                {pedidos.map(p => (
                    <MenuItem key={p.id_pedido} value={p.id_pedido}>
                        {p.codigo}{p.secuencia ? `-${p.secuencia}` : ''}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    )

    // Definición de columnas para DataTable
    const columns = [
        {
            id: 'n',
            label: 'N°',
            render: (_row, index) => index + 1
        },
        {
            id: 'codigo_secuencia',
            label: 'Codigo - Secuencia',
            render: (row) => {
                const label = row.codigo_secuencia_derived
                const chipColor = getChipColor(label)

                return (
                    <Chip
                        label={label}
                        size="small"
                        sx={{
                            fontWeight: 'bold',
                            backgroundColor: chipColor,
                            color: '#fff',
                            border: 'none'
                        }}
                    />
                )
            }
        },
        {
            id: 'descripcion_pedido_derived',
            label: 'Descripción del pedido'
        },
        {
            id: 'nombre_operacion',
            label: 'Nombre Operación'
        },
        {
            id: 'minutos_unidad',
            label: 'Minutos'
        }
    ]

    return (
        <Container maxWidth="xl">
            <DataTable
                title="Operaciones"
                columns={columns}
                data={filteredData}
                loading={loading}
                error={error}
                onAdd={handleOpenCreate}
                addLabel="Añadir Operación"
                onEdit={handleOpenEdit}
                onDelete={handleDeleteClick}
                idField="id_operacion_pedido"
                searchPlaceholder="Buscar..."
                filters={FilterComponent}
            />

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{isEditing ? 'Editar Operación' : 'Nueva Operación'}</DialogTitle>
                <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {isEditing && (
                        <TextField label="ID" value={formData.id_operacion_pedido} disabled fullWidth />
                    )}
                    <FormControl fullWidth>
                        <InputLabel>Pedido</InputLabel>
                        <Select
                            name="id_pedido"
                            value={formData.id_pedido}
                            label="Pedido"
                            onChange={handleFormChange}
                        >
                            {pedidos.map(p => (
                                <MenuItem key={p.id_pedido} value={p.id_pedido}>
                                    {p.codigo} - {p.secuencia ? `Sec: ${p.secuencia}` : ''} ({p.descripcion})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="Nombre"
                        name="nombre_operacion"
                        value={formData.nombre_operacion}
                        onChange={handleFormChange}
                        fullWidth
                        error={!!fieldErrors.nombre_operacion}
                        helperText={fieldErrors.nombre_operacion}
                    />
                    <TextField
                        label="Minutos"
                        name="minutos_unidad"
                        type="number"
                        value={formData.minutos_unidad}
                        onChange={handleFormChange}
                        fullWidth
                        error={!!fieldErrors.minutos_unidad}
                        helperText={fieldErrors.minutos_unidad}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
                    <Button onClick={isEditing ? handleEdit : handleCreate} variant="contained">
                        {isEditing ? 'Actualizar' : 'Crear'}
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog
                open={confirmOpen}
                title="Eliminar Operación"
                content="¿Estás seguro de que deseas eliminar esta operación? Esta acción no se puede deshacer."
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmOpen(false)}
                confirmText="Eliminar"
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    )
}

export default Operaciones