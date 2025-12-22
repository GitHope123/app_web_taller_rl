import { useState } from 'react'
import {
    Container,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    MenuItem,
    Box,
    Snackbar,
    Alert,
    Stack,
    Avatar,
    Typography,
    Chip,
    IconButton,
    CircularProgress
} from '@mui/material'
import { Person as PersonIcon } from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import api from '../services/api'
import DataTable from '../components/DataTable'
import ConfirmDialog from '../components/ConfirmDialog'
import ModernDialog from '../components/ModernDialog'
import { useAuthStore } from '../store/useAuthStore' // Use auth store instead of localStorage directly

/**
 * Página de Usuarios - CRUD
 * 
 * Gestión completa de usuarios (empleados y admins)
 */

function Usuarios() {
    const queryClient = useQueryClient()
    const { user } = useAuthStore()

    // React Query: Fetch Users
    const {
        data: usuarios = [],
        isLoading,
        isError,
        error
    } = useQuery({
        queryKey: ['usuarios'],
        queryFn: async () => {
            const res = await api.usuarios.getAll()
            if (!res.success) throw new Error(res.error)
            return res.data
        }
    })

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data) => api.usuarios.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['usuarios'])
            setSnackbar({ open: true, message: 'Usuario creado correctamente', severity: 'success' })
            closeDialog()
        },
        onError: (err) => {
            setSnackbar({ open: true, message: err.message || 'Error al crear', severity: 'error' })
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => api.usuarios.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['usuarios'])
            setSnackbar({ open: true, message: 'Usuario actualizado correctamente', severity: 'success' })
            closeDialog()
        },
        onError: (err) => {
            setSnackbar({ open: true, message: err.message || 'Error al actualizar', severity: 'error' })
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => api.usuarios.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['usuarios'])
            setSnackbar({ open: true, message: 'Usuario eliminado correctamente', severity: 'success' })
            setDeleteId(null)
            setConfirmOpen(false)
        },
        onError: (err) => {
            setSnackbar({ open: true, message: err.message || 'Error al eliminar', severity: 'error' })
        }
    })

    // Dialog / form state
    const [dialogOpen, setDialogOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({
        id_usuario: '',
        nombre: '',
        apellidos: '',
        dni: '',
        celular: '',
        rol: 'empleado',
        password: '',
    })

    // Confirmation Dialog state
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [deleteId, setDeleteId] = useState(null)

    // Estado para snackbar y errores
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
    const [errors, setErrors] = useState({})

    // Obtener rol
    const currentUserRole = user?.rol || 'empleado'

    const ROLES = ['empleado', 'admin']

    // Dialog handlers
    const openAdd = () => {
        setIsEditing(false)
        setEditingId(null)
        setFormData({
            id_usuario: '',
            nombre: '',
            apellidos: '',
            dni: '',
            celular: '',
            email: '',
            rol: 'empleado',
            password: '',
        })
        setErrors({})
        setDialogOpen(true)
    }

    const openEdit = (usuario) => {
        setIsEditing(true)
        setEditingId(usuario.id_usuario)
        setFormData({
            id_usuario: usuario.id_usuario || '',
            nombre: usuario.nombre || '',
            apellidos: usuario.apellidos || '',
            dni: '',
            celular: usuario.celular || '',
            email: usuario.email || '', // Nota: La tabla usuario no tiene email, es para display si se agregara
            rol: usuario.rol || 'empleado',
            password: '',
        })
        setErrors({})
        setDialogOpen(true)
    }

    const closeDialog = () => { setDialogOpen(false) }

    const handleChange = (e) => {
        const { name, value } = e.target
        let finalValue = value

        // Validación específica para DNI y Celular
        if (name === 'dni') {
            finalValue = value.replace(/[^0-9]/g, '')
            if (finalValue.length > 8) return

            // Auto-generación de email basada estrictamente en el DNI
            // Formato: [DNI]@taller.com
            const generatedEmail = finalValue ? `${finalValue}@taller.com` : ''

            setFormData(prev => ({
                ...prev,
                [name]: finalValue,
                email: generatedEmail
            }))
            return
        }

        if (name === 'celular') {
            finalValue = value.replace(/[^0-9]/g, '')
            if (finalValue.length > 9) return
        }

        // Si cambia nombre o apellidos, ya no afecta al email

        setFormData(prev => ({ ...prev, [name]: finalValue }))
    }

    const handleSave = () => {
        // Validate
        const newErrors = {}
        if (!formData.nombre.trim()) newErrors.nombre = 'Nombre es requerido'
        if (!formData.apellidos.trim()) newErrors.apellidos = 'Apellidos son requeridos'

        if (!isEditing) {
            if (!formData.email?.trim()) {
                newErrors.email = 'El correo es requerido'
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = 'Correo inválido'
            }

            if (!formData.dni.trim()) {
                newErrors.dni = 'DNI es requerido'
            } else if (formData.dni.length !== 8) {
                newErrors.dni = 'DNI debe tener exactamente 8 dígitos'
            }
            if (!formData.password || formData.password.length < 6) {
                newErrors.password = 'Contraseña debe tener al menos 6 caracteres'
            }
        } else {
            if (formData.dni && formData.dni.length !== 8) {
                newErrors.dni = 'DNI debe tener exactamente 8 dígitos'
            }
        }

        if (formData.celular && formData.celular.length !== 9) {
            newErrors.celular = 'Celular debe tener exactamente 9 dígitos'
        }

        if (!formData.rol) newErrors.rol = 'Rol es requerido'

        setErrors(newErrors)
        if (Object.keys(newErrors).length > 0) {
            setSnackbar({ open: true, message: 'Corrige los errores del formulario', severity: 'error' })
            return
        }

        if (isEditing) {
            const updateData = {
                nombre: formData.nombre,
                apellidos: formData.apellidos,
                celular: formData.celular,
                rol: formData.rol
            }
            if (formData.dni) updateData.dni = formData.dni
            // Password update via table is not supported in this view logic

            updateMutation.mutate({ id: editingId, data: updateData })
        } else {
            const { id_usuario, ...createData } = formData
            if (id_usuario && id_usuario.trim() !== '') {
                createData.id_usuario = id_usuario.trim()
            }
            createMutation.mutate(createData)
        }
    }

    const handleDeleteClick = (id) => {
        setDeleteId(id)
        setConfirmOpen(true)
    }

    const handleConfirmDelete = () => {
        if (!deleteId) return
        deleteMutation.mutate(deleteId)
    }

    const getRolColor = (rol) => {
        switch (rol) {
            case 'admin': return 'error'
            case 'empleado': return 'success'
            default: return 'default'
        }
    }

    // Definición de columnas para DataTable
    const columns = [
        {
            id: 'n',
            label: 'N°',
            render: (_row, index) => index + 1
        },
        {
            id: 'usuario',
            label: 'Usuario',
            render: (row) => (
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {row.nombre ? row.nombre[0].toUpperCase() : <PersonIcon />}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                            {row.nombre} {row.apellidos}
                        </Typography>
                    </Box>
                </Stack>
            )
        },
        {
            id: 'dni',
            label: 'DNI',
            render: (row) => (
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {row.dni}
                </Typography>
            )
        },
        {
            id: 'email',
            label: 'Correo',
            render: (row) => `${row.dni}@taller.com`
        },
        { id: 'celular', label: 'Celular', render: (row) => row.celular || '-' },
        { id: 'password', label: 'Contraseña', render: () => '********' },
        {
            id: 'rol',
            label: 'Rol',
            render: (row) => (
                <Chip
                    label={row.rol}
                    size="small"
                    color={getRolColor(row.rol)}
                    variant="outlined"
                />
            )
        }
    ]

    const isSaving = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

    return (
        <Container maxWidth="xl">
            <Box sx={{ py: 4 }}>
                <DataTable
                    title="Gestión de Usuarios"
                    columns={columns}
                    data={usuarios}
                    loading={isLoading}
                    error={isError ? error.message : null}
                    onAdd={openAdd}
                    onEdit={openEdit}
                    onDelete={handleDeleteClick}
                    rowKey="id_usuario"
                />

                {/* Dialog Create/Edit */}
                <ModernDialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
                    <DialogTitle>
                        {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </DialogTitle>
                    <DialogContent dividers>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            {/* ID field hidden as it is auto-generated */}
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    name="nombre"
                                    label="Nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    error={!!errors.nombre}
                                    helperText={errors.nombre}
                                    fullWidth
                                />
                                <TextField
                                    name="apellidos"
                                    label="Apellidos"
                                    value={formData.apellidos}
                                    onChange={handleChange}
                                    error={!!errors.apellidos}
                                    helperText={errors.apellidos}
                                    fullWidth
                                />
                            </Box>

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    name="dni"
                                    label="DNI"
                                    value={formData.dni}
                                    onChange={handleChange}
                                    error={!!errors.dni}
                                    helperText={errors.dni || (isEditing ? 'Dejar vacío para no cambiar' : '')}
                                    fullWidth
                                    placeholder={isEditing ? 'Nuevo DNI (opcional)' : ''}
                                />
                                <TextField
                                    name="celular"
                                    label="Celular"
                                    value={formData.celular}
                                    onChange={handleChange}
                                    fullWidth
                                />
                            </Box>

                            <TextField
                                name="email"
                                type="email"
                                label="Correo Electrónico (Auto-generado)"
                                value={formData.email}
                                onChange={handleChange}
                                error={!!errors.email}
                                helperText="Se genera automáticamente desde el DNI"
                                fullWidth
                                disabled
                                InputProps={{
                                    readOnly: true,
                                }}
                            />

                            <TextField
                                type="password"
                                name="password"
                                label="Contraseña"
                                value={formData.password}
                                onChange={handleChange}
                                error={!!errors.password}
                                helperText={errors.password || (isEditing ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres')}
                                fullWidth
                                placeholder={isEditing ? 'Nueva contraseña (opcional)' : ''}
                            />
                            <TextField
                                select
                                name="rol"
                                label="Rol"
                                value={formData.rol}
                                onChange={handleChange}
                                error={!!errors.rol}
                                helperText={errors.rol}
                                fullWidth
                            >
                                {ROLES.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeDialog} color="inherit">
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} variant="contained" disabled={isSaving}>
                            {isSaving ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </DialogActions>
                </ModernDialog>

                {/* Confirmation Dialog */}
                <ConfirmDialog
                    open={confirmOpen}
                    title="Eliminar Usuario"
                    content="¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer."
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
            </Box>
        </Container>
    )
}

export default Usuarios
