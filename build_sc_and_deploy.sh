#!/bin/bash

set -e

cd sc || exit 1

stellar contract build;
stellar contract optimize --wasm target/wasm32-unknown-unknown/release/hello_world.wasm;

output=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/hello_world.wasm \
  --source alice \
  --network testnet)
  
# Get the last line of the output
contractId=$(echo "$output" | tail -n 1)

echo "ContractID: $contractId"

stellar contract invoke \
  --id $contractId \
  --source alice \
  --network testnet \
  -- \
  increment

