#![no_std]
use soroban_sdk::{contract, contractimpl, log, symbol_short, Env, Symbol};


const COUNTER: Symbol = symbol_short!("COUNTER");


#[contract]
pub struct HelloContract;

#[contractimpl]
impl HelloContract {
    pub fn increment(env: Env) ->u32 {

         let mut count: u32 = env.storage().instance().get(&COUNTER).unwrap_or(0);

        count += 1;

        log!(&env, "count: {}", count);

        env.storage().instance().set(&COUNTER, &count);

        env.storage().instance().extend_ttl(100, 100);

        // env.events()
        // .publish((COUNTER, symbol_short!("increment")), count);

        count
    }
}

mod test;


