import { NestFactory } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const configService = app.get(ConfigService);

  // Register compression plugin
  await app.register(require('@fastify/compress'), {
    global: true,
    encodings: ['gzip', 'br'],
    brotliOptions: {
      params: {},
    },
    zlibOptions: {
      level: 6,
    },
  });

  // Register helmet plugin
  await app.register(require('@fastify/helmet'));

  // Enable CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGINS') === '*' 
      ? true 
      : configService.get<string>('CORS_ORIGINS')?.split(',') || '*',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global class serializer interceptor
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get('Reflector')));

  // Swagger configuration
  if (configService.get<boolean>('SWAGGER_ENABLE')) {
    const config = new DocumentBuilder()
      .setTitle('Meerai Backend API')
      .setDescription('Production-ready NestJS backend with Fastify, SWC, and MongoDB')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  if (configService.get<boolean>('SWAGGER_ENABLE')) {
    console.log(`📚 Swagger documentation: http://localhost:${port}/docs`);
  }
}

bootstrap();
