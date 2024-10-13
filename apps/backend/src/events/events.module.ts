import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { ContractsService } from 'src/contracts/contracts.service';
import { ContractsController } from 'src/contracts/contracts.controller';
import { ContractsModule } from 'src/contracts/contracts.module';

@Module({
  imports: [ContractsModule],
  providers: [EventsGateway],
  
})
export class EventsModule {}
