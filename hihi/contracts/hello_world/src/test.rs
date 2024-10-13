#![cfg(test)]

use super::*;
use soroban_sdk::{vec, Env, String};

// #[test]
// fn test() {
//     let env = Env::default();
//     let contract_id = env.register_contract(None, HelloContract);
//     let client = HelloContractClient::new(&env, &contract_id);

//     let words = client.hello(&String::from_str(&env, "Dev"));
//     assert_eq!(
//         words,
//         vec![
//             &env,
//             String::from_str(&env, "Hello"),
//             String::from_str(&env, "Dev"),
//         ]
//     );
// }

#[tokio::test]
pub async fn get_soroban_events(
    contract_address: &str, 
    start_ledger: u32
) -> Result<Vec<SorobanEvent>, Box<dyn std::error::Error>> {
    use soroban_sdk::{Env, Address, Symbol, Vec, BytesN};
    use stellar_sdk::{Server, Client, Horizon};

    // Initialize Stellar SDK client
    let horizon_url = "https://horizon-testnet.stellar.org";
    let client = Client::new(horizon_url)?;
    let server = Server::new(client);

    // Convert contract address to proper format
    let contract_id = Address::from_string(contract_address)?;

    // Set up event filter parameters
    let mut params = stellar_sdk::requests::EventsRequest::new();
    params.set_start_ledger(start_ledger);
    params.set_contract_id(contract_id);

    // Fetch events
    let events = server.get_events(params).await?;

    // Process and return events
    // let mut soroban_events = Vec::new();
    // for event in events.records {
    //     let soroban_event = SorobanEvent {
    //         ledger: event.ledger,
    //         contract_id: event.contract_id,
    //         topics: event.topics,
    //         data: event.data,
    //         timestamp: event.created_at,
    //     };
    //     soroban_events.push(soroban_event);
    // }

    // Ok(soroban_events)
}

// Define a struct to hold Soroban event data
// #[derive(Debug)]
struct SorobanEvent {
    ledger: u32,
    contract_id: BytesN<32>,
    topics: Vec<Symbol>,
    data: Vec<u8>,
    timestamp: String,
}
