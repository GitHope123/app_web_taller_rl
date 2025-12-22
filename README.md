# Sistema de Gestión de Taller R&L

El taller R&L se dedica a la producción de prendas por encargo. Actualmente, el registro de sus operaciones se realiza de forma manual, lo que ocasiona errores en la información, demoras en los procesos y cálculos imprecisos en los pagos.

Para atender esta problemática, se propone el desarrollo de un sistema web integral que permita la administración y el control eficiente de las operaciones del taller. La solución estará construida con tecnologías modernas y una arquitectura escalable, orientada a optimizar los procesos productivos, mejorar la trazabilidad de la información y garantizar una gestión más precisa y oportuna.


## Descripción General

Plataforma administrativa que permite gestionar de manera eficiente el flujo de trabajo en talleres de producción, desde la creación de pedidos hasta el registro detallado de trabajo realizado por empleados. El sistema proporciona herramientas completas para la asignación de operaciones, seguimiento en tiempo real y análisis de productividad.

## Características Principales

### Gestión de Usuarios
- Sistema de autenticación seguro con Supabase Auth
- Control de acceso basado en roles (Administrador/Empleado)
- Gestión completa de perfiles de usuario
- Restricción de acceso administrativo con registro de intentos

### Gestión de Pedidos
- Creación y seguimiento de pedidos con códigos únicos
- Gestión de secuencias y operaciones por pedido
- Control de cantidades totales y disponibles
- Asignación de operaciones a empleados
- Visualización detallada del estado de cada pedido

### Gestión de Operaciones
- Definición de operaciones con precios unitarios
- Asignación flexible de operaciones a pedidos
- Seguimiento de operaciones completadas
- Control de calidad y validación de cantidades

### Registro de Trabajo
- Registro detallado de trabajo realizado por empleado
- Cálculo automático de pagos basado en cantidad y precio
- Validación de cantidades contra asignaciones
- Historial completo de registros

### Dashboard Analítico
- KPIs en tiempo real (ingresos, pedidos activos, empleados activos)
- Gráficos de rendimiento por empleado
- Análisis de distribución de operaciones
- Estadísticas de pedidos completados vs pendientes
- Visualización de datos con Recharts

### Interfaz de Usuario
- Diseño moderno con Material-UI
- Modo claro/oscuro con persistencia
- Diseño responsivo para múltiples dispositivos
- Componentes reutilizables y modulares
- Experiencia de usuario optimizada

## Tecnologías Utilizadas

### Frontend
- **React 18.2.0** - Biblioteca principal para construcción de UI
- **Vite 5.0.0** - Build tool y servidor de desarrollo
- **Material-UI 5.14.18** - Framework de componentes UI
- **React Router DOM 6.20.0** - Enrutamiento de aplicación
- **TanStack Query 5.90.12** - Gestión de estado del servidor
- **Zustand 5.0.9** - Gestión de estado global
- **React Hook Form 7.69.0** - Manejo de formularios
- **Zod 4.2.1** - Validación de esquemas
- **Recharts 3.5.1** - Visualización de datos
- **Axios 1.6.2** - Cliente HTTP

### Backend y Base de Datos
- **Supabase** - Backend as a Service (BaaS)
- **PostgreSQL** - Base de datos relacional
- **Supabase Auth** - Sistema de autenticación
- **Row Level Security (RLS)** - Seguridad a nivel de fila

### Herramientas de Desarrollo
- **@vitejs/plugin-react** - Plugin de React para Vite
- **ESLint** - Linting de código
- **Git** - Control de versiones

## Estructura del Proyecto

```
app_web_taller_rl/
├── src/
│   ├── assets/              # Recursos estáticos (imágenes, logos)
│   ├── components/          # Componentes reutilizables
│   │   ├── DataTable.jsx    # Tabla de datos genérica
│   │   ├── Layout.jsx       # Layout principal con navegación
│   │   ├── ModernDialog.jsx # Componente de diálogo moderno
│   │   ├── ProtectedRoute.jsx # HOC para rutas protegidas
│   │   └── ThemeToggle.jsx  # Selector de tema claro/oscuro
│   ├── pages/               # Páginas de la aplicación
│   │   ├── Pedidos/         # Módulo de gestión de pedidos
│   │   │   ├── OrderAssignments.jsx
│   │   │   ├── OrderDetailsManager.jsx
│   │   │   └── OrderOperations.jsx
│   │   ├── Asignacion_Empleado.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── Operaciones.jsx
│   │   ├── Registros.jsx
│   │   └── Usuarios.jsx
│   ├── services/            # Servicios y APIs
│   │   ├── api.js           # Cliente API principal
│   │   └── authService.js   # Servicio de autenticación
│   ├── store/               # Estado global (Zustand)
│   ├── theme/               # Configuración de temas
│   │   └── theme.js         # Tema Material-UI personalizado
│   ├── App.jsx              # Componente raíz
│   ├── main.jsx             # Punto de entrada
│   └── index.css            # Estilos globales
├── *.sql                    # Scripts de base de datos
├── create_admin.mjs         # Script para crear usuario admin
├── index.html               # HTML principal
├── package.json             # Dependencias del proyecto
├── vite.config.js           # Configuración de Vite
└── README.md                # Este archivo
```

## Arquitectura del Sistema

### Arquitectura de Capas

```
┌─────────────────────────────────────────┐
│         Capa de Presentación            │
│  (React Components + Material-UI)       │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Capa de Gestión de Estado          │
│  (Zustand + TanStack Query + Context)   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Capa de Servicios               │
│    (API Client + Auth Service)          │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│           Supabase BaaS                 │
│  (Auth + PostgreSQL + RLS + Storage)    │
└─────────────────────────────────────────┘
```

### Flujo de Datos

1. **Autenticación**: Login → AuthService → Supabase Auth → Token JWT
2. **Consultas**: Component → TanStack Query → API Service → Supabase → PostgreSQL
3. **Mutaciones**: Form → React Hook Form → Validation (Zod) → API Service → Supabase
4. **Estado Global**: Zustand Store ↔ Components
5. **Tema**: Context API → ThemeProvider → Components

## Base de Datos

### Modelo de Datos Principal

**Tablas Principales:**
- `usuarios` - Información de usuarios del sistema
- `pedidos` - Pedidos de producción
- `operaciones` - Catálogo de operaciones disponibles
- `asignacion_empleado` - Asignaciones de operaciones a empleados
- `registro_trabajo` - Registro de trabajo realizado

### Relaciones

```
usuarios (1) ──── (N) asignacion_empleado
pedidos (1) ──── (N) asignacion_empleado
operaciones (1) ──── (N) asignacion_empleado
asignacion_empleado (1) ──── (N) registro_trabajo
```

### Seguridad

- **Row Level Security (RLS)** habilitado en todas las tablas
- Políticas de acceso basadas en roles
- Validación de datos a nivel de base de datos
- Confirmación automática de usuarios

## Instalación y Configuración

### Requisitos Previos

- Node.js >= 16.0.0
- npm >= 8.0.0
- Cuenta de Supabase
- Git

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd app_web_taller_rl
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Crear archivo `.env` en la raíz del proyecto:
   ```env
   VITE_SUPABASE_URL=tu_supabase_url
   VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
   ```

4. **Configurar base de datos**
   
   Ejecutar los scripts SQL en el siguiente orden:
   ```bash
   # 1. Configurar políticas RLS
   fix_rls_policies.sql
   fix_insert_policy.sql
   fix_recursive_policy.sql
   
   # 2. Configurar columnas y confirmación
   add_email_column.sql
   fix_email_confirmation.sql
   auto_confirm_users.sql
   ```

5. **Crear usuario administrador**
   ```bash
   node create_admin.mjs
   ```

### Ejecución

**Modo Desarrollo:**
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`

**Build de Producción:**
```bash
npm run build
```

**Preview de Producción:**
```bash
npm run preview
```

## Uso del Sistema

### Acceso Inicial

1. Navegar a la página de login
2. Ingresar credenciales de administrador
3. El sistema validará el rol antes de permitir el acceso

### Flujo de Trabajo Típico

1. **Crear Operaciones** - Definir las operaciones disponibles con sus precios
2. **Registrar Empleados** - Dar de alta a los trabajadores en el sistema
3. **Crear Pedidos** - Registrar nuevos pedidos con código y secuencia
4. **Asignar Operaciones** - Asignar operaciones específicas a empleados
5. **Registrar Trabajo** - Los empleados registran el trabajo completado
6. **Monitorear Dashboard** - Supervisar métricas y rendimiento en tiempo real

### Gestión de Pedidos

El módulo de pedidos permite:
- Crear pedidos con código único y secuencia
- Definir cantidad total del pedido
- Asignar múltiples operaciones
- Gestionar operaciones específicas del pedido
- Visualizar cantidad disponible vs cantidad total
- Seguimiento del estado de completitud

### Asignación de Operaciones

- Seleccionar empleado, pedido y operación
- Definir cantidad asignada (validada contra disponibilidad)
- Visualización de asignaciones activas
- Edición y eliminación de asignaciones

### Registro de Trabajo

- Registro de unidades completadas por empleado
- Cálculo automático de pago (cantidad × precio)
- Validación contra cantidad asignada
- Historial completo de registros

## Características de Seguridad

### Autenticación
- JWT tokens con Supabase Auth
- Sesiones persistentes
- Logout seguro con limpieza de estado

### Autorización
- Control de acceso basado en roles
- Restricción de rutas administrativas
- Validación de permisos en cada operación

### Validación de Datos
- Validación de formularios con Zod
- Sanitización de inputs
- Validación a nivel de base de datos
- Prevención de inyección SQL

### Políticas RLS
- Acceso controlado a nivel de fila
- Políticas específicas por tabla
- Prevención de acceso no autorizado

## Optimizaciones de Rendimiento

- **Code Splitting** - Carga bajo demanda de componentes
- **React Query Caching** - Cache inteligente de datos del servidor
- **Virtualización** - Renderizado eficiente de listas largas (react-window)
- **Memoización** - Optimización de re-renders con useMemo/useCallback
- **Lazy Loading** - Carga diferida de componentes pesados

## Mantenimiento

### Actualización de Dependencias
```bash
npm update
npm audit fix
```

### Backup de Base de Datos
Utilizar las herramientas de backup de Supabase o exportar vía SQL:
```bash
# Desde Supabase Dashboard > Database > Backups
```

### Logs y Monitoreo
- Logs de autenticación en Supabase Auth
- Logs de base de datos en Supabase Dashboard
- Errores de frontend en consola del navegador

## Solución de Problemas

### Error de Conexión a Supabase
- Verificar variables de entorno en `.env`
- Confirmar que las credenciales son correctas
- Revisar configuración de CORS en Supabase

### Problemas de Autenticación
- Verificar que el usuario existe en Supabase Auth
- Confirmar que el email está verificado
- Revisar políticas RLS en la tabla usuarios

### Errores de Validación
- Revisar esquemas Zod en formularios
- Verificar constraints de base de datos
- Confirmar formato de datos enviados

### Problemas de Rendimiento
- Revisar cache de React Query
- Optimizar consultas a base de datos
- Implementar paginación en tablas grandes

## Roadmap

### Versión 1.1
- [ ] Exportación de reportes a PDF/Excel
- [ ] Notificaciones en tiempo real
- [ ] Sistema de permisos granular
- [ ] Auditoría de cambios

### Versión 1.2
- [ ] Aplicación móvil para empleados
- [ ] Dashboard de empleados
- [ ] Sistema de metas y bonificaciones
- [ ] Integración con sistemas de pago

### Versión 2.0
- [ ] Multi-tenant support
- [ ] API REST pública
- [ ] Integraciones con ERP
- [ ] Machine Learning para predicciones

## Contribución

Este es un proyecto privado. Para contribuir:

1. Crear una rama feature desde main
2. Realizar cambios con commits descriptivos
3. Asegurar que el código pase las validaciones
4. Crear Pull Request para revisión

## Licencia

Proyecto privado - Todos los derechos reservados

## Contacto y Soporte

Para soporte técnico o consultas sobre el sistema, contactar al equipo de desarrollo.

---

**Versión:** 0.1.0  
**Última Actualización:** Diciembre 2024  
**Estado:** En Desarrollo Activo
