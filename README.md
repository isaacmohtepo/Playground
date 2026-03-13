# CreativeFlow

SaaS para agencias de marketing que centraliza revisión visual y aprobación de piezas creativas.

## Arquitectura

- `apps/api`: API en NestJS + Prisma + PostgreSQL + JWT.
- `apps/web`: Frontend en Next.js + TypeScript + Tailwind + React Query.
- `packages/shared`: Tipos y contratos compartidos.
- `AWS S3`: almacenamiento de archivos (vía URL de archivo por versión, listo para presigned URLs).
- `Email`: capa de notificaciones desacoplada (`NotificationsService`) preparada para SES/SendGrid.

### Flujo principal

1. Agencia crea cliente y campañas.
2. Sube piezas creativas y versiones.
3. Genera un link público de revisión.
4. Cliente comenta con pin en coordenadas exactas o aprueba.
5. Agencia responde, resuelve comentarios y publica nuevas versiones.
6. Plataforma notifica eventos por email.

## Modelo de datos

Definido en [apps/api/prisma/schema.prisma](./apps/api/prisma/schema.prisma) con entidades:

- `User`
- `Client`
- `Campaign`
- `CreativeAsset`
- `AssetVersion`
- `Comment` (hilos + coordenadas + timestamp opcional)
- `Approval`
- `ReviewLink`
- `NotificationEvent`

## API principal

### Auth

- `POST /auth/register`
- `POST /auth/login`

### Clientes

- `GET /clients`
- `POST /clients`
- `GET /clients/:id`

### Campañas

- `GET /campaigns?clientId=...`
- `POST /campaigns`
- `GET /campaigns/:id`

### Piezas y versiones

- `GET /assets?campaignId=...`
- `POST /assets`
- `GET /assets/:id`
- `POST /assets/:id/versions`
- `GET /assets/:id/versions/:versionId`
- `POST /assets/:id/review-links`

### Comentarios visuales

- `GET /comments/version/:versionId`
- `POST /comments/version/:versionId`
- `POST /comments/:commentId/reply`
- `PATCH /comments/:commentId/resolve`

### Aprobaciones

- `POST /assets/:id/versions/:versionId/approve`

### Revisión pública (sin cuenta)

- `GET /review/:token`
- `POST /review/:token/comments`
- `POST /review/:token/comments/:commentId/reply`
- `POST /review/:token/approve`

## Frontend

Pantallas incluidas:

- Dashboard principal
- Lista de clientes
- Detalle de cliente y campañas
- Detalle de campaña y piezas
- Visualizador de creativos con pins de comentario
- Vista pública por token de revisión

## Ejecutar local

### 1) Requisitos

- Node.js 20+
- Docker (opcional, recomendado para PostgreSQL)

### 2) Variables de entorno

#### API (`apps/api/.env`)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/creativeflow?schema=public"
JWT_SECRET="super-secret-jwt-key"
PORT=4000
APP_URL="http://localhost:3000"
DEFAULT_ADMIN_EMAIL="admin@creativeflow.com"
DEFAULT_ADMIN_PASSWORD="admin123"
DEFAULT_ADMIN_NAME="CreativeFlow Admin"
```

#### Web (`apps/web/.env.local`)

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

### 3) Base de datos

```bash
docker run --name creativeflow-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=creativeflow -p 5432:5432 -d postgres:16
```

### 4) Instalar y migrar

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 5) Levantar apps

En dos terminales:

```bash
npm run dev:api
npm run dev:web
```

Abrir `http://localhost:3000`.

Credenciales por defecto: `admin@creativeflow.com` / `admin123`.

## Producción

- Desplegar API en ECS/Fargate, Railway o Render con autoscaling.
- Web en Vercel o CloudFront + S3.
- PostgreSQL administrado (RDS/Neon/Supabase).
- S3 para binarios + CloudFront CDN.
- Cola para notificaciones (SQS + worker) para evitar bloqueo de requests.
- Observabilidad: OpenTelemetry + logs estructurados + métricas.
