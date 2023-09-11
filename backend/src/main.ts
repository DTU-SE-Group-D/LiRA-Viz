import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Creates a Nest application instance
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3002);
}
bootstrap();
