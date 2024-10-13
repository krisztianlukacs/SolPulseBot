import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ContractsService } from './contracts/contracts.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const contractsService = app.get(ContractsService);
  contractsService.watchContracts()
  app.enableCors();
  await app.listen(4000);
}
bootstrap();
