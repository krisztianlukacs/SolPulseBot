const { SorobanRpc } = require('@stellar/stellar-sdk');

async function getSorobanEvents(contractId, startLedger) {
  const rpcServer = new SorobanRpc.Server("https://soroban-testnet.stellar.org:443");
  
//   const latestLedger = await rpcServer.getLatestLedger();

  let events = [];
  let paginationId = null;

//   console.log(latestLedger.sequence)
  


while (true) {
    const eventsResponse = await rpcServer.getEvents({
        startLedger: 410441,
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
  console.log(eventsResponse)

}



  
//   while (true) {
//     try {
    

//       events = events.concat(eventsResponse.events);

//       if (!eventsResponse.latestLedger) {
//         break;
//       }

//       paginationId = eventsResponse.events[eventsResponse.events.length - 1].id;
//       startLedger = eventsResponse.latestLedger;
//     } catch (error) {
//       console.error("Error fetching events:", error);
//       break;
//     }
//   }

//   return events.map(event => ({
//     id: event.id,
//     ledger: event.ledger,
//     contractId: event.contractId,
//     topic: event.topic,
//     value: event.value,
//     timestamp: new Date(event.createdAt).toISOString()
//   }));
}

// Usage example
const contractId = 'CDNY3NFIYTMXLK3XK3WNQZVBR2VMPRIOQREBCW6JIANPLCEUCRUPIVJE';
const startLedger = 410441;

getSorobanEvents(contractId, startLedger)
  .then(events => {
    console.log("Soroban events:", events);
  })
  .catch(error => {
    console.error("Error:", error);
  });





  