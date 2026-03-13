import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

function normalizeOrigin(origin: string) {
  return origin.trim().replace(/\/+$/, "").toLowerCase();
}

function matchWildcardOrigin(origin: string, pattern: string) {
  const cleanPattern = normalizeOrigin(pattern);
  if (!cleanPattern.includes("*")) {
    return false;
  }
  const regex = new RegExp(`^${cleanPattern.replace(/\./g, "\\.").replace(/\*/g, ".*")}$`, "i");
  return regex.test(normalizeOrigin(origin));
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const rawOrigins = [
    process.env.APP_URL,
    process.env.WEB_URL,
    process.env.FRONTEND_URL,
    ...(process.env.CORS_ORIGINS?.split(",") ?? [])
  ]
    .map((origin) => origin?.trim())
    .filter((origin): origin is string => Boolean(origin));
  const explicitOrigins = rawOrigins.map((origin) => normalizeOrigin(origin));

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      const incomingOrigin = normalizeOrigin(origin);
      const allowedByExact = explicitOrigins.includes(incomingOrigin);
      const allowedByWildcard = rawOrigins.some((pattern) => matchWildcardOrigin(incomingOrigin, pattern));

      if (explicitOrigins.length === 0 || allowedByExact || allowedByWildcard) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin not allowed by CORS: ${origin}`), false);
    },
    credentials: true
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true
    })
  );

  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  await app.listen(port);
}

bootstrap();
