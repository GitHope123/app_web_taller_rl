import React, { useState } from 'react'
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    Button,
    TextField,
    IconButton,
    InputAdornment
} from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material'

/**
 * Componente de tabla reutilizable con estilos estandarizados
 * Basado en el diseño de Operaciones.jsx
 * 
 * @param {string} title - Título de la tabla
 * @param {Array} columns - Definición de columnas: { id, label, align, render, minWidth }
 * @param {Array} data - Datos a mostrar
 * @param {boolean} loading - Estado de carga
 * @param {string} error - Mensaje de error
 * @param {function} onAdd - Función al hacer click en botón crear
 * @param {string} addLabel - Texto del botón crear
 * @param {function} onEdit - Función al editar (recibe el objeto row)
 * @param {function} onDelete - Función al eliminar (recibe el id de row)
 * @param {string} idField - Nombre del campo ID en los datos (default: 'id')
 * @param {string} searchPlaceholder - Placeholder del buscador
 */
const DataTable = ({
    title,
    columns = [],
    data = [],
    loading = false,
    error = null,
    onAdd,
    addLabel = 'Nuevo',
    onEdit,
    onDelete,
    idField = 'id',
    rowKey, // Add backward compatibility or alias
    searchPlaceholder = 'Buscar...',
    filters = null,
    customActions = null // (row) => ReactNode
}) => {
    // Use rowKey if provided, otherwise idField
    const keyField = rowKey || idField
    const [searchTerm, setSearchTerm] = useState('')

    // Filtrado simple del cliente
    const filteredData = data.filter(row =>
        Object.values(row).some(val =>
            val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    )

    return (
        <Box sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4, minHeight: '60vh' }}>
                {title && (
                    <Typography variant="h4" gutterBottom>
                        {title}
                    </Typography>
                )}

                {/* Barra de herramientas: Buscador y Filtros izquierda, Botón Crear derecha */}
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
                        <TextField
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            size="small"
                            sx={{ width: '100%', maxWidth: 300 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        {filters}
                    </Box>

                    {onAdd && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={onAdd}
                            sx={{ minWidth: 120 }}
                        >
                            {addLabel}
                        </Button>
                    )}
                </Box>

                {/* Loading */}
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                )}

                {/* Error */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {/* Tabla */}
                {!loading && !error && (
                    <TableContainer component={Paper} variant="outlined">
                        <Table>
                            <TableHead sx={{ bgcolor: '#e3f2fd' }}>
                                <TableRow>
                                    {columns.map((col) => (
                                        <TableCell
                                            key={col.id}
                                            align={col.align || 'left'}
                                            style={{ minWidth: col.minWidth }}
                                        >
                                            <strong>{col.label}</strong>
                                        </TableCell>
                                    ))}
                                    {(onEdit || onDelete || customActions) && (
                                        <TableCell align="center">
                                            <strong>Acciones</strong>
                                        </TableCell>
                                    )}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {filteredData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={columns.length + (onEdit || onDelete || customActions ? 1 : 0)} align="center">
                                            {searchTerm ? 'No se encontraron resultados' : 'No hay registros disponibles'}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredData.map((row, index) => (
                                        <TableRow key={row[keyField]} hover>
                                            {columns.map((col) => (
                                                <TableCell key={col.id} align={col.align || 'left'}>
                                                    {col.render ? col.render(row, index) : row[col.id]}
                                                </TableCell>
                                            ))}

                                            {(onEdit || onDelete || customActions) && (
                                                <TableCell align="center">
                                                    {onEdit && (
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={() => onEdit(row)}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    )}
                                                    {onDelete && (
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => onDelete(row[keyField])}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    )}
                                                    {customActions && customActions(row)}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Box>
    )
}

export default DataTable
