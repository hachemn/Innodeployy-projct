import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // enlève les champs inconnus
      forbidNonWhitelisted: true,  // erreur si champ non autorisé
      transform: true,             // transforme le body en DTO class
    }),
  );

  await app.listen(3000);
}
bootstrap();