# API de CreativeFlow

Base URL local: `http://localhost:4000`

## Auth

- `POST /auth/register`
- `POST /auth/login`

## Clientes (JWT)

- `GET /clients`
- `GET /clients/:id`
- `POST /clients`

## Campañas (JWT)

- `GET /campaigns?clientId=<id>`
- `GET /campaigns/:id`
- `POST /campaigns`

## Piezas y versiones (JWT)

- `GET /assets?campaignId=<id>`
- `GET /assets/:id`
- `POST /assets`
- `POST /assets/:id/versions`
- `GET /assets/:id/versions/:versionId`
- `POST /assets/:id/review-links`
- `POST /assets/:id/versions/:versionId/approve`

## Comentarios visuales (JWT)

- `GET /comments/version/:versionId`
- `POST /comments/version/:versionId`
- `POST /comments/:commentId/reply`
- `PATCH /comments/:commentId/resolve`

## Revisión pública (sin cuenta)

- `GET /review/:token`
- `POST /review/:token/comments`
- `POST /review/:token/comments/:commentId/reply`
- `POST /review/:token/approve`
