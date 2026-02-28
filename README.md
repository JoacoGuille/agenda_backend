# Up Agenda Backend

Backend REST para Up Agenda. La idea es simple: el front le pega a esta API con JSON y listo, sin vueltas. Tiene auth con JWT, eventos, categorias, amigos, grupos, notificaciones y resumen de dashboard.

**Stack**
- Node.js + Express
- MongoDB + Mongoose
- JWT
- Resend (emails)

**Instalacion y ejecucion**
1. Clona el repo.
2. Instala dependencias.

```bash
npm install
```

3. Copia `sample.env` a `.env` y completa valores reales.
4. Levanta el server en dev.

```bash
npm run dev
```

Para correr en modo prod:

```bash
npm start
```

**Variables de entorno**
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `RESEND_API_KEY`
- `RESEND_FROM`
- `FRONTEND_URL`
- `APP_URL`
- `API_URL`

En desarrollo, si faltan `FRONTEND_URL`, `APP_URL` o `API_URL`, se usan valores locales por defecto. En produccion son obligatorias y el server no arranca si falta algo.

**Base URL**
El front apunta a:

```
VITE_API_URL=https://tu-backend.onrender.com
```

Si preferis usar prefijo `/api`, tambien existe:

```
VITE_API_URL=https://tu-backend.onrender.com/api
```

**JWT**
- Login devuelve `{ token, user }`
- Rutas protegidas esperan `Authorization: Bearer <token>`

**Errores**
- Siempre JSON.
- 404 devuelve:

```json
{ "message": "Route not found", "path": "/lo-que-sea", "method": "GET" }
```

**Ejemplos de requests (curl)**

Registro
```bash
curl -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Joaquin\",\"email\":\"joaquin@mail.com\",\"password\":\"123456\"}"
```

Login
```bash
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"joaquin@mail.com\",\"password\":\"123456\"}"
```

Listar eventos
```bash
curl "$BASE_URL/events" \
  -H "Authorization: Bearer $TOKEN"
```

Crear evento
```bash
curl -X POST "$BASE_URL/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"title\":\"Clase React\",\"startAt\":\"2026-03-02T09:30:00Z\",\"endAt\":\"2026-03-02T11:00:00Z\"}"
```

**Endpoints**

Auth
- `POST /auth/register`
- `GET /auth/verify-email?token=...`
- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/resend-verification`

Eventos
- `GET /events`
- `GET /events/:id`
- `POST /events`
- `PUT /events/:id`
- `DELETE /events/:id`

Query en `GET /events`: `from`, `to`, `categoryId`, `search`

Categorias
- `GET /categories`
- `GET /categories/:id`
- `POST /categories`
- `PUT /categories/:id`
- `DELETE /categories/:id`

Dashboard
- `GET /dashboard/summary`

Notificaciones
- `GET /notifications`
- `POST /notifications/:id/accept`
- `POST /notifications/:id/reject`
- `POST /notifications/mark-all-read`

Amigos
- `GET /friends`
- `POST /friends/invite`
- `POST /friends/accept`
- `POST /friends/reject`

Grupos
- `GET /groups`
- `GET /groups/:id`
- `POST /groups`
- `PUT /groups/:id`
- `DELETE /groups/:id`
- `POST /groups/:id/invite-link`
- `POST /groups/:id/invite`
- `GET /groups/:id/invites`

Busqueda
- `GET /search?q=...`

**Coleccion de pruebas (Postman)**
Dejo una coleccion lista para importar:
- `postman_collection.json`

Variables sugeridas:
- `baseUrl` (ej: `http://localhost:4000`)
- `token` (el JWT del login)

**Deploy (Render recomendado)**
1. Crea un Web Service.
2. Build command: `npm install`
3. Start command: `npm start`
4. Agrega las variables del `.env`.
5. Setea `NODE_ENV=production`.

Ejemplo de envs en produccion:
```
FRONTEND_URL=https://tu-frontend.vercel.app
APP_URL=https://tu-frontend.vercel.app
API_URL=https://tu-backend.onrender.com
RESEND_API_KEY=tu_api_key
RESEND_FROM=Up Agenda <no-reply@tu-dominio.com>
```

Railway es parecido: servis new, set envs, build `npm install`, start `npm start`.

Con eso el backend queda listo para consumir desde el front.
