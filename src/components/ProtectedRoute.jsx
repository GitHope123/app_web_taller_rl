import { Navigate } from 'react-router-dom'
import { authService } from '../services/authService'

/**
 * Componente de Ruta Protegida
 * Verifica si el usuario está autenticado antes de permitir el acceso
 */
function ProtectedRoute({ children }) {
    const token = authService.getToken()

    if (!token) {
        // Si no hay token, redirigir al login
        return <Navigate to="/login" replace />
    }

    // Si hay token, renderizar el componente hijo
    return children
}

export default ProtectedRoute
