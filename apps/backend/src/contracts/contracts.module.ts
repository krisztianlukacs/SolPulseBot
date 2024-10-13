import { Module } from '@nestjs/common';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';

@Module({
  controllers: [ContractsController],
  providers: [ContractsService,ContractsController],
  exports: [ContractsController,ContractsService]
})
export class ContractsModule {}
