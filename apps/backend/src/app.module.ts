import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ContractsModule } from './contracts/contracts.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    EventsModule,
    ContractsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
