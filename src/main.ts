import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');

  // Every route lives under /api (Swagger UI stays at /docs, outside the prefix).
  app.setGlobalPrefix('api');

  // Validate every incoming payload: strip unknown props, reject extras, and
  // transform plain objects into their DTO classes (enables type coercion).
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Lets Nest run lifecycle hooks (e.g. PrismaService.onModuleDestroy) on
  // SIGINT/SIGTERM so DB connections close cleanly on shutdown.
  app.enableShutdownHooks();

  app.enableCors();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('ContentFlow API')
    .setDescription('Content production management platform API')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
}
bootstrap();
