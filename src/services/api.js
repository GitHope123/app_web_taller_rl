import { createClient } from '@supabase/supabase-js'
import { supabase, supabaseUrl, supabaseAnonKey } from '../lib/supabaseClient'

/**
 * Servicio centralizado de API para Supabase
 * Proporciona funciones optimizadas y escalables para todas las operaciones CRUD
 */

// ==================== CACHE SYSTEM ====================
class CacheManager {
    constructor() {
        this.cache = new Map()
        this.cacheDuration = 20 * 1000 // 20 segundos (antes 5 min)
    }

    set(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        })
    }

    get(key) {
        const cached = this.cache.get(key)
        if (!cached) return null

        const isExpired = Date.now() - cached.timestamp > this.cacheDuration
        if (isExpired) {
            this.cache.delete(key)
            return null
        }

        return cached.data
    }

    clear(pattern) {
        if (pattern) {
            // Limpiar cache que coincida con el patrón
            for (const key of this.cache.keys()) {
                if (key.includes(pattern)) {
                    this.cache.delete(key)
                }
            }
        } else {
            // Limpiar todo el cache
            this.cache.clear()
        }
    }
}

const cache = new CacheManager()

// ==================== GENERIC CRUD OPERATIONS ====================

/**
 * Operación genérica de lectura (READ)
 * @param {string} table - Nombre de la tabla
 * @param {object} options - Opciones de consulta
 * @returns {Promise<{success: boolean, data: any[], error: string}>}
 */
export const fetchData = async (table, options = {}) => {
    const {
        select = '*',
        orderBy = null,
        ascending = false,
        limit = null,
        filters = {},
        useCache = false // Cache deshabilitado por defecto para datos en tiempo real
    } = options

    // Generar clave de cache
    const cacheKey = `${table}_${JSON.stringify(options)}`

    // Verificar cache
    if (useCache) {
        const cached = cache.get(cacheKey)
        if (cached) {
            console.log(`📦 Cache hit: ${table}`)
            return { success: true, data: cached, error: null }
        }
    }

    try {
        let query = supabase.from(table).select(select)

        // Aplicar filtros
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                query = query.eq(key, value)
            }
        })

        // Aplicar ordenamiento
        if (orderBy) {
            query = query.order(orderBy, { ascending })
        }

        // Aplicar límite
        if (limit) {
            query = query.limit(limit)
        }

        const { data, error } = await query

        if (error) throw error

        // Guardar en cache
        if (useCache) {
            cache.set(cacheKey, data)
        }

        return { success: true, data: data || [], error: null }
    } catch (err) {
        console.error(`Error fetching ${table}:`, err)
        return { success: false, data: [], error: err.message }
    }
}

/**
 * Operación genérica de creación (CREATE)
 * @param {string} table - Nombre de la tabla
 * @param {object|array} data - Datos a insertar
 * @returns {Promise<{success: boolean, data: any, error: string}>}
 */
export const createData = async (table, data) => {
    try {
        const { data: result, error } = await supabase
            .from(table)
            .insert(Array.isArray(data) ? data : [data])
            .select()

        if (error) throw error

        // Limpiar cache relacionado
        cache.clear(table)

        return { success: true, data: result, error: null }
    } catch (err) {
        console.error(`Error creating ${table}:`, err)
        return { success: false, data: null, error: err.message }
    }
}

/**
 * Operación genérica de actualización (UPDATE)
 * @param {string} table - Nombre de la tabla
 * @param {string} idField - Campo ID de la tabla
 * @param {string} id - ID del registro
 * @param {object} data - Datos a actualizar
 * @returns {Promise<{success: boolean, data: any, error: string}>}
 */
export const updateData = async (table, idField, id, data) => {
    try {
        const { data: result, error } = await supabase
            .from(table)
            .update(data)
            .eq(idField, id)
            .select()

        if (error) throw error

        // Limpiar cache relacionado
        cache.clear(table)

        return { success: true, data: result, error: null }
    } catch (err) {
        console.error(`Error updating ${table}:`, err)
        return { success: false, data: null, error: err.message }
    }
}

/**
 * Operación genérica de eliminación (DELETE)
 * @param {string} table - Nombre de la tabla
 * @param {string} idField - Campo ID de la tabla
 * @param {string} id - ID del registro
 * @returns {Promise<{success: boolean, error: string}>}
 */
export const deleteData = async (table, idField, id) => {
    try {
        const { error } = await supabase
            .from(table)
            .delete()
            .eq(idField, id)

        if (error) throw error

        // Limpiar cache relacionado
        cache.clear(table)

        return { success: true, error: null }
    } catch (err) {
        console.error(`Error deleting ${table}:`, err)
        return { success: false, error: err.message }
    }
}

// ==================== UTILS ====================
// Helper to generate UUIDs locally if needed
const generateUUID = () => self.crypto.randomUUID()

// ==================== SPECIFIC TABLE OPERATIONS ====================

// USUARIOS
export const usuariosAPI = {
    getAll: (options = {}) => fetchData('usuario', {
        orderBy: 'fecha_creacion',
        ascending: false,
        useCache: false, // Deshabilitar cache para usuarios para asegurar consistencia
        ...options
    }),

    getById: (id) => fetchData('usuario', {
        filters: { id_usuario: id },
        limit: 1
    }),

    getByRol: (rol) => fetchData('usuario', {
        filters: { rol },
        orderBy: 'nombre',
        ascending: true
    }),

    create: async (usuarioData) => {
        try {
            // 1. Crear usuario en Supabase Auth
            // Usamos un cliente temporal para no cerrar la sesión del admin actual
            const tempSupabase = createClient(supabaseUrl, supabaseAnonKey, {
                auth: { persistSession: false }
            })

            const email = usuarioData.email || `${usuarioData.dni}@taller.com`
            const password = usuarioData.password

            if (!password) throw new Error('Password is required for user creation')

            const { data: authData, error: authError } = await tempSupabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        rol: usuarioData.rol
                    }
                }
            })

            if (authError) throw authError
            if (!authData.user) throw new Error('No se pudo crear el usuario en Auth')

            const userId = authData.user.id

            // 2. Crear usuario en tabla pública 'usuario'
            // Filtramos datos para tabla pública
            const publicUserData = {
                id_usuario: userId,
                nombre: usuarioData.nombre,
                apellidos: usuarioData.apellidos,
                dni: usuarioData.dni,
                celular: usuarioData.celular,
                // email: usuarioData.email, // No guardamos email en tabla pública
                rol: usuarioData.rol
            }

            return await createData('usuario', publicUserData)
        } catch (error) {
            console.error('Error creating user:', error)
            return { success: false, data: null, error: error.message }
        }
    },

    update: (id, usuarioData) => updateData('usuario', 'id_usuario', id, usuarioData),

    delete: (id) => deleteData('usuario', 'id_usuario', id),

    setPassword: async (userId, newPassword) => {
        // Nota: Actualizar contraseña de otro usuario requiere privilegios de admin/service_role
        // O usar updateUser si es el propio usuario.
        // Aquí simulamos update local por ahora, pero idealmente debería ser auth.admin.updateUser
        console.warn('setPassword not fully implemented for other users without Admin API')
        return { success: false, error: 'Not implemented' }
    }
}

// PEDIDOS
export const pedidosAPI = {
    getAll: (options = {}) => fetchData('pedido', {
        orderBy: 'fecha',
        ascending: false,
        ...options
    }),

    getById: (id) => fetchData('pedido', {
        filters: { id_pedido: id },
        limit: 1
    }),

    getByCodigo: (codigo) => fetchData('pedido', {
        filters: { codigo },
        limit: 1
    }),

    create: (pedidoData) => {
        const data = { ...pedidoData }
        if (!data.id_pedido) data.id_pedido = generateUUID()
        return createData('pedido', data)
    },

    update: (id, pedidoData) => updateData('pedido', 'id_pedido', id, pedidoData),

    delete: (id) => deleteData('pedido', 'id_pedido', id)
}

// ASIGNACIONES
export const asignacionesAPI = {
    getAll: (options = {}) => fetchData('asignacion', {
        orderBy: 'fecha_asignacion',
        ascending: false,
        ...options
    }),

    getById: (id) => fetchData('asignacion', {
        filters: { id_asignacion: id },
        limit: 1
    }),

    getByPedido: (idPedido) => fetchData('asignacion', {
        filters: { id_pedido: idPedido }
    }),

    getByUsuario: (idUsuario) => fetchData('asignacion', {
        filters: { id_usuario: idUsuario }
    }),

    create: (asignacionData) => {
        const data = { ...asignacionData }
        if (!data.id_asignacion) data.id_asignacion = generateUUID()
        return createData('asignacion', data)
    },

    update: (id, asignacionData) => updateData('asignacion', 'id_asignacion', id, asignacionData),

    delete: (id) => deleteData('asignacion', 'id_asignacion', id)
}

// PAGOS
export const pagosAPI = {
    getAll: (options = {}) => fetchData('pago', {
        orderBy: 'fecha_pago',
        ascending: false,
        ...options
    }),

    getById: (id) => fetchData('pago', {
        filters: { id_pago: id },
        limit: 1
    }),

    getByPedido: (idPedido) => fetchData('pago', {
        filters: { id_pedido: idPedido }
    }),

    getByUsuario: (idUsuario) => fetchData('pago', {
        filters: { id_usuario: idUsuario }
    }),

    create: (pagoData) => {
        const data = { ...pagoData }
        if (!data.id_pago) data.id_pago = generateUUID()
        return createData('pago', data)
    },

    update: (id, pagoData) => updateData('pago', 'id_pago', id, pagoData),

    delete: (id) => deleteData('pago', 'id_pago', id)
}

// REGISTROS DE TRABAJO
export const registrosAPI = {
    getAll: (options = {}) => fetchData('registro_trabajo', {
        orderBy: 'fecha_registro',
        ascending: false,
        ...options
    }),

    getById: (id) => fetchData('registro_trabajo', {
        filters: { id_registro: id },
        limit: 1
    }),

    getByAsignacion: (idAsignacion) => fetchData('registro_trabajo', {
        filters: { id_asignacion: idAsignacion }
    }),

    create: (registroData) => {
        const data = { ...registroData }
        if (!data.id_registro) data.id_registro = generateUUID()
        return createData('registro_trabajo', data)
    },

    update: (id, registroData) => updateData('registro_trabajo', 'id_registro', id, registroData),

    delete: (id) => deleteData('registro_trabajo', 'id_registro', id)
}

// OPERACIONES DE PEDIDO
export const operacionesAPI = {
    getAll: (options = {}) => fetchData('operaciones_pedido', options),

    getById: (id) => fetchData('operaciones_pedido', {
        filters: { id_operacion_pedido: id },
        limit: 1
    }),

    getByPedido: (idPedido) => fetchData('operaciones_pedido', {
        filters: { id_pedido: idPedido }
    }),

    create: (operacionData) => {
        const data = { ...operacionData }
        if (!data.id_operacion_pedido) data.id_operacion_pedido = generateUUID()
        return createData('operaciones_pedido', data)
    },

    update: (id, operacionData) => updateData('operaciones_pedido', 'id_operacion_pedido', id, operacionData),

    delete: (id) => deleteData('operaciones_pedido', 'id_operacion_pedido', id)
}

// GASTOS FIJOS
export const gastosFijosAPI = {
    getAll: (options = {}) => fetchData('gastos_fijos', options),

    getById: (id) => fetchData('gastos_fijos', {
        filters: { id_gasto: id },
        limit: 1
    }),

    getByPedido: (idPedido) => fetchData('gastos_fijos', {
        filters: { id_pedido: idPedido }
    }),

    create: (gastoData) => {
        const data = { ...gastoData }
        if (!data.id_gasto) data.id_gasto = generateUUID()
        return createData('gastos_fijos', data)
    },

    update: (id, gastoData) => updateData('gastos_fijos', 'id_gasto', id, gastoData),

    delete: (id) => deleteData('gastos_fijos', 'id_gasto', id)
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Obtener estadísticas generales del sistema
 */
export const getStats = async () => {
    try {
        const [pedidos, usuarios, asignaciones, pagos, registros] = await Promise.all([
            supabase.from('pedido').select('*', { count: 'exact', head: true }),
            supabase.from('usuario').select('*', { count: 'exact', head: true }),
            supabase.from('asignacion').select('*', { count: 'exact', head: true }),
            supabase.from('pago').select('monto'),
            supabase.from('registro_trabajo').select('*', { count: 'exact', head: true }),
        ])

        const montoTotal = pagos.data?.reduce((sum, pago) => sum + (Number(pago.monto) || 0), 0) || 0

        return {
            success: true,
            data: {
                totalPedidos: pedidos.count || 0,
                totalUsuarios: usuarios.count || 0,
                totalAsignaciones: asignaciones.count || 0,
                totalPagos: pagos.data?.length || 0,
                totalRegistrosTrabajo: registros.count || 0,
                montoTotalPagos: montoTotal,
            },
            error: null
        }
    } catch (err) {
        console.error('Error fetching stats:', err)
        return { success: false, data: null, error: err.message }
    }
}

/**
 * Limpiar todo el cache
 */
export const clearCache = () => {
    cache.clear()
    console.log('🗑️ Cache cleared')
}

/**
 * Limpiar cache de una tabla específica
 */
export const clearTableCache = (table) => {
    cache.clear(table)
    console.log(`🗑️ Cache cleared for table: ${table}`)
}

// Exportar el objeto completo de API
export const api = {
    usuarios: usuariosAPI,
    pedidos: pedidosAPI,
    asignaciones: asignacionesAPI,
    pagos: pagosAPI,
    registros: registrosAPI,
    operaciones: operacionesAPI,
    gastosFijos: gastosFijosAPI,
    stats: getStats,
    cache: {
        clear: clearCache,
        clearTable: clearTableCache
    }
}

export default api
