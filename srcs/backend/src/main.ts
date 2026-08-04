import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';


async function bootstrap() {


  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('ft_transcendence API')
    .setDescription('API documentation for ft_transcendence project')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3001, '0.0.0.0');
}
bootstrap();
