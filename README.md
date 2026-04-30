**Descripción del servicio**
- **Control de Piezas (Frontend)**: Interfaz de gestión para proyectos, bloques y piezas de fabricación naval. Provee vistas para listar y filtrar proyectos, bloques y piezas, dashboards de reportes y autenticación de usuarios.

**Endpoints principales (resumen)**
- **Autenticación**
	- POST /api/v1/login — Iniciar sesión
	- GET  /api/v1/me    — Información del usuario autenticado
	- POST /api/v1/logout — Cerrar sesión
- **Proyectos**
	- GET  /api/v1/proyectos — Listar proyectos (paginado)
	- GET  /api/v1/proyectos/:id — Detalle de proyecto
	- GET  /api/v1/proyectos/:id/bloques — Bloques de un proyecto
- **Bloques**
	- GET  /api/v1/bloques — Listar todos los bloques (filtros: proyecto_id)
	- GET  /api/v1/bloques?proyecto_id=1 — Filtrar por proyecto
	- POST /api/v1/proyectos/{proyecto_id}/bloques — Crear bloque (JSON)
	- PUT  /api/v1/bloques/{bloque_id} — Editar bloque (JSON)
	- DELETE /api/v1/bloques/{bloque_id} — Eliminar bloque
- **Piezas**
	- GET  /api/v1/piezas — Listar piezas (filtros: proyecto_id, estado, bloque_id)
	- POST /api/v1/bloques/{bloque_id}/piezas — Crear pieza
	- PUT  /api/v1/piezas/{pieza_id} — Actualizar pieza
	- DELETE /api/v1/piezas/{pieza_id} — Eliminar pieza
- **Reportes / Estadísticas**
	- GET /api/v1/reportes/pendientes-por-proyecto
	- GET /api/v1/reportes/totales-por-estado

> Nota: Rutas listadas aquí resumen el API esperado por el frontend; el backend puede exponer nombres o versiones diferentes (/api/v1/...).

**Variables de entorno (recomendadas)**
- `VITE_API_BASE_URL` — URL base del API (ej: https://api.example.com/api/v1)
- `VITE_APP_TITLE` — Título corto de la app (opcional)
- `VITE_ENABLE_ANALYTICS` — true/false para telemetría
- `NODE_ENV` — entorno (development|production)

Coloca estas variables en un archivo `.env` o `.env.local` en la raíz del frontend según tus necesidades.

**Usuario de prueba**
- Email: `demo@example.com`
- Contraseña: `secret123`

**Pasos de ejecución**
1. Instalar dependencias
```bash
npm install
```
2. Ejecutar en modo desarrollo (Vite)
```bash
npm run dev
```
3. Construir para producción
```bash
npm run build
```
4. Servir la build (preview)
```bash
npm run preview
```
5. (Opcional) Con Docker / docker-compose
```bash
docker-compose up --build
```

**Decisiones técnicas**
- Framework: Vue 3 (Composition API) — elegido por su reactividad y composition patterns para componentes complejos.
- Bundler / Dev server: Vite — arranque rápido en desarrollo y build optimizado.
- State management: Pinia — stores ligeros para `auth` y `ui`.
- HTTP: Axios con instancias (`piecesApi`, `authApi`) y manejo centralizado de token.
- CSS: Tailwind CSS con capas y utilidades personalizadas (`src/style.css`) para componentes como `modal`, `panel`, `skeleton` y utilidades visuales.
- Arquitectura de vistas: patrón `page-hero` + `page-panel` para consistencia visual; tablas con skeletons y animaciones.
- Rutas: Vue Router con guardas globales que requieren autenticación para rutas privadas y muestran mensajes (toast) antes de redirigir.

**Notas operativas y recomendaciones**
- Asegúrate de definir `VITE_API_BASE_URL` antes de iniciar para que las llamadas Axios apunten al backend correcto.
- Si el CSS se rompe (ej: clases de modal no aplicadas), revisa `src/style.css` y confirma que las clases usadas en los componentes coincidan con las definidas en el archivo de estilos.
- Para agregar nuevas rutas o vistas sigue la estructura existente en `src/views/` y registra la ruta en `src/router/index.js`.

Si quieres, puedo:
- Añadir ejemplos concretos de payloads (JSON) para cada endpoint.
- Agregar instrucciones de despliegue específicas (NGINX, Azure, Docker Hub).
- Ejecutar una verificación rápida de `npm run build` y corregir errores detectados.
