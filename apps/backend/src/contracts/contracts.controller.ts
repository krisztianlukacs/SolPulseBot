import { Controller, Get, Logger, Param } from '@nestjs/common';
import { ContractsService } from './contracts.service';

@Controller('contracts')
export class ContractsController {

    constructor(private readonly contractsService: ContractsService) {}
    private readonly logger = new Logger(ContractsController.name);


    @Get(':id')
    async findOne(@Param('id') id: string): Promise<any[]> {
        const events = await this.contractsService.getEvents(id)
        
        events.forEach(event => {
            this.contractsService.saveToFile(id,event)
        })

        const eventsFromFile = this.contractsService.getEventsFromFile(id)
        return eventsFromFile;
    }

}
