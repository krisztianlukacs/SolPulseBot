import { Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { readdirSync } from 'fs';
import { homedir } from 'os';
import { resolve } from 'path';
import { ContractsController } from 'src/contracts/contracts.controller';
import { ContractsService } from 'src/contracts/contracts.service';
import { Server,Socket } from 'socket.io';

@WebSocketGateway({cors: true})
export class EventsGateway {

  constructor(
    private readonly contractsController: ContractsController,
    private readonly contractsService: ContractsService,
  ) {}
  private readonly logger = new Logger(EventsGateway.name);
  private readonly connectedClients: Map<string, Socket> = new Map()

  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket) {
    const clientId = socket.id;
    this.connectedClients.set(clientId, socket);
    socket.on('disconnect', () => {
      this.connectedClients.delete(clientId);
    });
  }

  @Cron('45 * * * * *')
    async watchContracts() {
      
      this.logger.debug('Called when the current second is 45');
      const contractIdDirectory = resolve(homedir(), 'easystellarlogs');
      const contractIdDirectories = readdirSync(contractIdDirectory)
      for await (const contractId of contractIdDirectories) {
        const events = await this.contractsService.getEvents(contractId)
        events.forEach(event => {
            this.contractsService.saveToFile(contractId,event)
           
        });

        const eventsToSend = this.contractsService.getEventsFromFile(contractId)
        if (eventsToSend.length > 0){
          this.connectedClients.forEach(client => {
            console.log("we made it", eventsToSend)
            client.emit("message",JSON.stringify(eventsToSend))
          });
        }
      }
    }


  @SubscribeMessage('message')
  async handleMessage(@MessageBody() contractId: string): Promise<any[]> {
    const events = await this.contractsController.findOne(contractId)
    return events;
  }
}
