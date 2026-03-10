# Arquitectura de CreativeFlow

## 1) Visión general

CreativeFlow se diseñó como monorepo para habilitar evolución rápida y despliegue independiente de frontend/backend.

- Frontend: Next.js (App Router), TypeScript, Tailwind, React Query.
- Backend: NestJS modular + Prisma ORM.
- Base de datos: PostgreSQL.
- Storage: AWS S3 (con posibilidad de URL firmadas para upload/download).
- Auth: JWT para usuarios internos de agencia.
- Revisión pública: token firmado persistido en `ReviewLink`.

## 2) Componentes y responsabilidades

### `apps/api`

- `AuthModule`: registro/login y emisión de JWT.
- `ClientsModule`: gestión de clientes.
- `CampaignsModule`: campañas por cliente.
- `AssetsModule`: piezas, versiones, estados, links de revisión y aprobaciones internas.
- `CommentsModule`: comentarios visuales con pin `x/y`, hilos y resolución.
- `ReviewModule`: experiencia pública sin cuenta (comentarios y aprobación por token).
- `NotificationsModule`: cola lógica de eventos de email desacoplada.

### `apps/web`

- Dashboard operacional.
- Gestión de clientes/campañas/piezas.
- Visualizador de creativos con captura de coordenadas de clic.
- Panel lateral para hilos de comentarios.
- Portal público de revisión.

## 3) Decisiones de escalabilidad

- Modelo de datos orientado a historial (`AssetVersion`, `Approval` inmutable).
- Estados de flujo explícitos (`ApprovalState`) para trazabilidad.
- `NotificationEvent` como outbox para procesar emails de forma asíncrona en workers.
- Links públicos desacoplados por token revocable (`isActive`, `expiresAt`).
- API stateless con JWT para escalar horizontalmente.

## 4) Seguridad

- Endpoints internos protegidos por JWT (`JwtAuthGuard`).
- Endpoints públicos limitados a token de revisión.
- Hash de contraseñas con bcrypt.
- Validación de payloads con `class-validator`.

## 5) Extensiones previstas (bonus)

- Comentarios por timestamp en video: soportado vía campo `timestampSec`.
- Anotaciones dibujadas: agregar entidad `DrawingAnnotation` por versión.
- Slack: publicar `NotificationEvent` en webhook.
- Asset library: entidad `AssetLibraryItem` con tags y carpetas.
