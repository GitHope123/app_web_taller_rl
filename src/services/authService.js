import { supabase } from '../lib/supabaseClient'

export const authService = {
  async login(email, password) {
    try {
      // 1. Iniciar sesión con Supabase Auth directamente con email
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        throw authError
      }

      // 2. Obtener datos del usuario de la tabla pública
      const { data: userData, error: userError } = await supabase
        .from('usuario')
        .select('*')
        .eq('id_usuario', authData.user.id)
        .single()

      if (userError || !userData) {
        // Fallback: Si no existe perfil, intentar crearlo con los metadatos si existen
        console.warn('Usuario autenticado sin perfil público. Datos faltantes.')
        throw new Error('Usuario no encontrado en la base de datos (Perfil faltante)')
      }

      // 3. Guardar en localStorage para mantener compatibilidad
      localStorage.setItem('token', authData.session.access_token)
      localStorage.setItem('user', JSON.stringify(userData))

      return {
        success: true,
        data: {
          user: userData,
          token: authData.session.access_token
        }
      }
    } catch (error) {
      console.error('Error en login:', error)
      return {
        success: false,
        error: 'Credenciales inválidas o error de conexión'
      }
    }
  },

  async register(userData) {
    // Nota: El registro de Auth debe hacerse con cuidado si lo hace un admin.
    // Esta función asume registro público o sincronización.
    // Convertimos DNI a email para Auth
    try {
      const email = `${userData.dni}@taller.com`
      const password = userData.password

      // 1. Crear usuario en Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre: userData.nombre,
            apellidos: userData.apellidos,
            rol: userData.rol
          }
        }
      })

      if (authError) throw authError

      // 2. El usuario en tabla 'usuario' se debería crear via api.usuarios.create
      // o aquí mismo.

      return {
        success: true,
        data: authData
      }
    } catch (error) {
      console.error('Error en registro:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  async logout() {
    // 1. Limpieza local inmediata para UX rápida
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    // 2. Cerrar sesión en servidor (Supabase)
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error al cerrar sesión en Supabase:', error)
    }
  },

  getToken() {
    return localStorage.getItem('token')
  },

  getUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  isAuthenticated() {
    return !!this.getToken()
  }
}
