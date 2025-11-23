# 🏘️ Dashboard de Seguridad Vecinal

Dashboard administrativo para la gestión de usuarios, alertas y geografía de comunidades residenciales. Sistema completo con autenticación JWT, control de acceso basado en roles (RBAC) y visualizaciones de datos en tiempo real.

## 🚀 Tech Stack

- **Framework**: Next.js 15.5.2 (Pages Router)
- **UI**: React 18.2.0 + Tailwind CSS 3.3.6
- **Estado**: React Query (@tanstack/react-query 5.90.10)
- **HTTP**: Axios 1.13.2
- **Componentes**: Headless UI + Heroicons
- **Gráficos**: Recharts 3.4.1
- **Autenticación**: JWT (Access + Refresh Tokens)

## ✨ Características

### 🔐 Autenticación y Seguridad
- Sistema JWT con access token (memoria) y refresh token (httpOnly cookies)
- Refresh automático de tokens mediante interceptores
- Control de acceso basado en roles (SUPER_ADMIN, ADMIN_VILLA, VECINO)
- Rutas protegidas con validación de permisos
- Manejo robusto de errores de autenticación

### 👥 Gestión de Usuarios
- CRUD completo de usuarios
- Búsqueda global y filtros avanzados
- Verificación de usuarios con asignación de sectores
- Cambio de roles (solo SUPER_ADMIN)
- Activación/desactivación de cuentas

### 🚨 Gestión de Alertas
- Visualización de alertas de seguridad
- Estadísticas y filtros por villa, sector y fechas
- Dashboard con alertas recientes
- Estados: ACTIVA, RESUELTA, FALSA_ALARMA

### 🗺️ Gestión Geográfica
- Jerarquía: Ciudades → Comunas → Villas → Sectores
- Gestión completa de la estructura geográfica
- Asignación de usuarios a villas y sectores

### 📊 Dashboard y Visualizaciones
- Estadísticas en tiempo real
- Gráficos de barras (usuarios por mes)
- Gráficos de pastel (distribución de roles)
- Cards con métricas clave

## 🏗️ Arquitectura

```
dashboard-seguridad/
├── lib/
│   ├── api/                    # Servicios API
│   │   ├── auth.js            # Autenticación
│   │   ├── users.js           # Usuarios
│   │   ├── alertas.js         # Alertas
│   │   ├── geografia.js       # Geografía
│   │   ├── dashboard.js       # Dashboard
│   │   └── client.js          # Cliente Axios
│   └── queryClient.js         # React Query config
├── src/
│   ├── components/
│   │   ├── layout/            # Layout, Header, Sidebar
│   │   └── ProtectedRoute.js  # HOC de protección
│   ├── contexts/
│   │   └── AuthContext.js     # Estado global de auth
│   ├── pages/
│   │   ├── _app.js            # App wrapper
│   │   ├── index.js           # Home (redirect)
│   │   ├── login.js           # Login
│   │   └── dashboard/         # Páginas del dashboard
│   └── styles/
│       └── globals.css        # Estilos globales
└── public/                    # Archivos estáticos
```

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js 18+ 
- npm o yarn
- Backend API corriendo en `http://localhost:8082` (o configurar `NEXT_PUBLIC_API_URL`)

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd dashboard-seguridad

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tu configuración
```

### Variables de Entorno

Crear archivo `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8082
```

### Desarrollo

```bash
# Iniciar servidor de desarrollo (puerto 3000)
npm run dev

# Build de producción
npm run build

# Servidor de producción
npm start

# Linting
npm run lint
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## 🔑 Roles y Permisos

| Rol | Acceso Dashboard | Permisos |
|-----|------------------|----------|
| `SUPER_ADMIN` | ✅ | Acceso total, gestión de roles |
| `ADMIN_VILLA` | ✅ | Gestión de su villa |
| `VECINO` | ❌ | Solo app móvil |

## 📡 API Services

### Auth Service
- `login(email, password)` - Autenticación
- `logout()` - Cerrar sesión
- `refreshToken()` - Renovar token
- `isAuthenticated()` - Verificar sesión

### Users Service
- `getRecentUsers()` - Usuarios recientes
- `searchUsers(query)` - Búsqueda global
- `createUser(userData)` - Crear usuario
- `updateUser(id, userData)` - Actualizar usuario
- `toggleVerification(id, sector)` - Verificar usuario
- `changeUserRole(id, role)` - Cambiar rol
- `deleteUser(id)` - Eliminar usuario

### Alertas Service
- `getStats(filters)` - Estadísticas de alertas
- `getRecientes(limit)` - Alertas recientes
- `getAll(page, size)` - Lista paginada

### Geografía Service
- `getCiudades()` - Lista de ciudades
- `getComunas(ciudadId)` - Comunas por ciudad
- `getVillas(comunaId)` - Villas por comuna
- `getSectoresByVilla(villaId)` - Sectores de villa
- `getJerarquiaCompleta()` - Jerarquía completa

## 🔒 Seguridad

### Almacenamiento de Tokens

| Dato | Ubicación | Motivo |
|------|-----------|--------|
| Access Token | Memoria (variable JS) | Máxima seguridad |
| Refresh Token | Cookie httpOnly | Seguro contra XSS |
| Datos de Usuario | localStorage | No sensibles |

### Flujo de Autenticación

1. Login → Recibe access + refresh tokens
2. Access token guardado en memoria
3. Refresh token en cookie httpOnly
4. Interceptor agrega token a cada petición
5. Si 401 → Refresh automático
6. Si refresh falla → Redirect a login

## 🎨 UI/UX

- **Design System**: Tailwind CSS utility-first
- **Componentes**: Headless UI (accesibles)
- **Iconos**: Heroicons (outline 24x24)
- **Responsive**: Mobile-first design
- **Tema**: Light mode (blue primary)

## 📊 React Query

Configuración de cache y estado asíncrono:

```javascript
// Query keys principales
['dashboard-stats']      // Estadísticas
['recent-users']         // Usuarios recientes
['alert-stats']          // Stats de alertas
['users', page, size]    // Lista paginada
['user', id]             // Usuario específico
```

## 🛠️ Desarrollo

### Estructura de Componentes

```javascript
// Página protegida típica
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/layout/Layout';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Layout>
        {/* Contenido */}
      </Layout>
    </ProtectedRoute>
  );
}
```

### Uso de React Query

```javascript
import { useQuery } from '@tanstack/react-query';
import { usersService } from '@/lib/api/users';

const { data, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: () => usersService.getRecentUsers()
});
```

### Uso de Auth Context

```javascript
import { useAuth } from '@/contexts/AuthContext';

const { user, login, logout, isSuperAdmin } = useAuth();
```

## 📝 Scripts Disponibles

```bash
npm run dev      # Desarrollo (puerto 3000)
npm run build    # Build de producción
npm start        # Servidor de producción
npm run lint     # Linting con ESLint
```

## 🚀 Deployment

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 📚 Documentación Adicional

- Arquitectura detallada del proyecto
- Flujos de trabajo con diagramas
- Modelos de datos completos
- Patrones de diseño utilizados
- Mejores prácticas de seguridad
- Guías de debugging

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

## 🆘 Soporte

Para problemas o preguntas:
- Abrir un issue en el repositorio
- Contactar al equipo de desarrollo

---

**Desarrollado con ❤️ para comunidades más seguras**
