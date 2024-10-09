import websocket
import json
import time

def on_message(ws, message):
    data = json.loads(message)
    print(f"Real-time state change: {data}")
    # Here you can send a Telegram message if needed

def on_error(ws, error):
    print(f"Error: {error}")

def on_close(ws, close_status_code, close_msg):
    print("Connection closed")

def on_open(ws):
    print("Connection opened")
    # For example, a subscription message to monitor a specific account
    subscription_message = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "programSubscribe",
        "params": [
            "9xQeWvG816bUx9EPjH8YkB4f9ASkqQK9qxWv1H9AoQS",  # Serum DEX Program ID
            {
                "encoding": "jsonParsed"
            }
        ]
    }
    ws.send(json.dumps(subscription_message))

if __name__ == "__main__":
    websocket_url = "wss://api.mainnet-beta.solana.com"  # WebSocket URL
    ws = websocket.WebSocketApp(websocket_url,
                                on_open=on_open,
                                on_message=on_message,
                                on_error=on_error,
                                on_close=on_close)
    #ws.run_forever()
    

    def run_websocket():
        while True:
            try:
                ws.run_forever()
            except Exception as e:
                print(f"Connection closed: {e}")
                print("Reconnecting in 5 seconds...")
                time.sleep(5)

    run_websocket()
