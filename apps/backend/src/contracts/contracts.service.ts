import { Injectable, Logger } from '@nestjs/common';
import { SorobanRpc } from '@stellar/stellar-sdk';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { globSync } from "glob"
import { resolve } from 'path';
import { homedir } from 'os';


@Injectable()
export class ContractsService {
    private readonly logger = new Logger(ContractsService.name);
    private rpcServer = new SorobanRpc.Server("https://soroban-testnet.stellar.org:443");


    async getEvents(contractId: string): Promise<any[]> {
        const latestLedger = await this.rpcServer.getLatestLedger();
        const eventsResponse = await this.rpcServer.getEvents({
            startLedger: latestLedger.sequence - 8000,
            filters: [
                {
                    type: "contract",
                    contractIds: [contractId],
                },
                {
                    type: "system",
                    contractIds: [contractId],
                },
                {
                    type: "diagnostic",
                    contractIds: [contractId],
                },
            ],
        });
        return eventsResponse.events
    }

    getEventsFromFile(contractId: string): any[] {
        const filenameGlob = resolve(homedir(), 'easystellarlogs', contractId, `*.json`);
        const files = globSync(filenameGlob)
        const events = files.map(file => {
            const eventString = readFileSync(file, "utf-8")
            const event = JSON.parse(eventString)
            return event
        })
        return events
    }


    saveToFile(contractId: string, event: any) {
        const eventId = event.id;
        const filename = resolve(homedir(), 'easystellarlogs', contractId, `${eventId}.json`);
        if (!existsSync(filename)) {
            const data = {
                ...event,
                time: new Date().toISOString()
            }
            const contractIdDirectory = resolve(homedir(), 'easystellarlogs', contractId);
            if (!existsSync(contractIdDirectory)) {
                mkdirSync(contractIdDirectory, {recursive: true})
            }
            writeFileSync(filename, JSON.stringify(data))
        }
    }




}
