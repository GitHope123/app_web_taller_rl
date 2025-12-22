import { useState, useEffect } from 'react'
import {
    Container,
    Box,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material'
import api from '../services/api'
import DataTable from '../components/DataTable'

function Registros() {
    const [registros, setRegistros] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [asignMap, setAsignMap] = useState({})
    const [userMap, setUserMap] = useState({})
    const [pedidosMap, setPedidosMap] = useState({})
    const [pedidosList, setPedidosList] = useState([])
    const [pedidoFilter, setPedidoFilter] = useState('')
    const [operacionesMap, setOperacionesMap] = useState({})

    const fetchAllData = async () => {
        try {
            setLoading(true)
            setError(null)

            // Promise.all to fetch all related data
            const [regRes, asignRes, userRes, pedidosRes, opsRes] = await Promise.all([
                api.registros.getAll(),
                api.asignaciones.getAll(),
                api.usuarios.getAll(),
                api.pedidos.getAll(),
                api.operaciones.getAll()
            ])

            if (!regRes.success) throw new Error(regRes.error || 'Error fetching registros')

            setRegistros(regRes.data || [])

            // Build helper maps
            const amap = {}
            if (asignRes.success && asignRes.data) {
                asignRes.data.forEach(a => { amap[a.id_asignacion] = a })
            }
            setAsignMap(amap)

            const umap = {}
            if (userRes.success && userRes.data) {
                userRes.data.forEach(u => { umap[u.id_usuario] = u })
            }
            setUserMap(umap)

            const pmap = {}
            if (pedidosRes.success && pedidosRes.data) {
                pedidosRes.data.forEach(p => { pmap[p.id_pedido] = p })
            }
            setPedidosMap(pmap)
            setPedidosList(pedidosRes.data || [])

            const opmap = {}
            if (opsRes.success && opsRes.data) {
                opsRes.data.forEach(op => { opmap[op.id_operacion_pedido] = op })
            }
            setOperacionesMap(opmap)

        } catch (err) {
            console.error('Error fetching data:', err)
            setError(err.message || 'Error al cargar datos')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAllData()
    }, [])

    // Group records by id_asignacion
    const groupedRegistrosMap = {}
    registros.forEach(r => {
        if (!groupedRegistrosMap[r.id_asignacion]) {
            groupedRegistrosMap[r.id_asignacion] = {
                ...r,
                cantidad_trabajada: 0,
                pago: 0,
                // Keep track of the latest date
                fecha_registro: r.fecha_registro
            }
        }

        // Accumulate values
        groupedRegistrosMap[r.id_asignacion].cantidad_trabajada += parseFloat(r.cantidad_trabajada || 0)
        groupedRegistrosMap[r.id_asignacion].pago += parseFloat(r.pago || 0)

        // Update date if current record is newer
        if (new Date(r.fecha_registro) > new Date(groupedRegistrosMap[r.id_asignacion].fecha_registro)) {
            groupedRegistrosMap[r.id_asignacion].fecha_registro = r.fecha_registro
        }
    })

    const groupedRegistros = Object.values(groupedRegistrosMap)

    // Prepare data for DataTable
    const tableData = groupedRegistros.map(r => {
        const asign = asignMap[r.id_asignacion]
        const user = asign ? userMap[asign.id_usuario] : null
        const pedido = asign ? pedidosMap[asign.id_pedido] : null
        const operacion = asign ? operacionesMap[asign.id_operacion_pedido] : null

        const nombreUsuario = user
            ? `${user.nombre || ''} ${user.apellidos || ''}`.trim()
            : (asign ? 'Usuario No Encontrado' : '-')

        const codigoPedido = pedido
            ? `${pedido.codigo}${pedido.secuencia ? '-' + pedido.secuencia : ''}`
            : '-'

        const nombreOperacion = operacion ? operacion.nombre_operacion : '-'

        return {
            ...r,
            nombre_usuario_derived: nombreUsuario,
            codigo_pedido_derived: codigoPedido,
            nombre_operacion_derived: nombreOperacion,
            cantidad_asignada_derived: asign ? asign.cantidad_asignada : 0, // Get cantidad_asignada
            raw_id_pedido: pedido ? pedido.id_pedido : null
        }
    })

    // Filter logic
    const filteredData = pedidoFilter
        ? tableData.filter(row => row.raw_id_pedido === pedidoFilter)
        : tableData

    // Dropdown Component
    const FilterComponent = (
        <FormControl size="small" sx={{ minWidth: 300 }}>
            <InputLabel>Filtrar por Pedido</InputLabel>
            <Select
                value={pedidoFilter}
                label="Filtrar por Pedido"
                onChange={(e) => setPedidoFilter(e.target.value)}
            >
                <MenuItem value="">
                    <em>Todos</em>
                </MenuItem>
                {pedidosList.map(p => (
                    <MenuItem key={p.id_pedido} value={p.id_pedido}>
                        {p.codigo}{p.secuencia ? `-${p.secuencia}` : ''} ({p.descripcion || 'Sin descripción'})
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    )

    const columns = [
        {
            id: 'n',
            label: 'N°',
            render: (_row, index) => index + 1
        },
        {
            id: 'nombre_usuario_derived',
            label: 'Nombre Trabajador',
            // Allow searching by this field
        },
        {
            id: 'codigo_pedido_derived',
            label: 'Pedido',
            render: (row) => row.codigo_pedido_derived !== '-' && (
                <Chip
                    label={row.codigo_pedido_derived}
                    size="small"
                    variant="outlined"
                    color="primary"
                />
            )
        },
        {
            id: 'nombre_operacion_derived',
            label: 'Operación'
        },
        {
            id: 'cantidad_asignada_derived',
            label: 'Cant. Asignada'
        },
        {
            id: 'cantidad_trabajada',
            label: 'Cant. Avanzada'
        },
        {
            id: 'pago',
            label: 'Pago Total',
            // quiero $ a Soles S/.
            render: (row) => row.pago ? `S/${parseFloat(row.pago).toFixed(2)}` : '-'
        },
        {
            id: 'fecha_registro',
            label: 'Última Fecha',
            render: (row) => row.fecha_registro ? new Date(row.fecha_registro).toLocaleDateString() : '-'
        }
    ]

    return (
        <Container maxWidth="xl">
            <Box sx={{ py: 4 }}>
                <DataTable
                    title="Registros de Trabajo"
                    columns={columns}
                    data={filteredData}
                    loading={loading}
                    error={error}
                    searchPlaceholder="Buscar por nombre, pedido..."
                    idField="id_registro"
                    filters={FilterComponent}
                />
            </Box>
        </Container>
    )
}

export default Registros
