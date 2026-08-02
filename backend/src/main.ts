import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { EnvService } from './configs/env.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const envService = app.get(EnvService);
  app.enableCors({ origin: envService.corsOrigin });

  // Best-effort: some entity/controller combination trips a `@nestjs/swagger` CLI-plugin
  // schema-generation edge case (a "circular dependency" false positive on a plain class with
  // no decorators). API docs are dev tooling, not a runtime dependency, so a failure here must
  // never take down the whole server — log it and keep booting without /docs.
  try {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(envService.appName)
      .setDescription('API documentation')
      .setVersion('1.0')
      .build();
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, swaggerDocument);
  } catch (err) {
    Logger.warn(
      `Swagger document generation failed — /docs will be unavailable this run: ${
        err instanceof Error ? err.message : String(err)
      }`,
      'Bootstrap',
    );
  }

  await app.listen(envService.port);
}
void bootstrap();
