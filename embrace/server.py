# server.py

import asyncio
import json
import websockets
import requests


async def process_message(websocket, path):
    try:
        async for message in websocket:
            data = json.loads(message)
            input_message = data["inputMessage"]
            max_length = data["maxLength"]
            top_p = data["topP"]
            temperature = data["temperature"]
            max_rounds = data["maxRounds"]
            use_stream_chat = data["useStreamChat"]
            # Here, you should integrate the ChatGPT model to generate a response
            # For demonstration purposes, we're simply echoing the user's message
            await websocket.send(json.dumps({"responseMessage": input_message}))
            query_message = {"query": input_message,
                             "max_length": max_length,
                             "top_p": top_p,
                             "temperature": temperature,
                             "maxRounds": max_rounds,
                             "use_stream_chat": use_stream_chat}
            response = requests.post(
                "http://localhost:18789", json=query_message)
            if response.status_code == 200:
                result = response.json()
                bot_message = {"responseMessage": " ".join(result["response"]),
                               "maxLength": max_length,
                               "topP": top_p,
                               "temperature": temperature,
                               "maxRounds": max_rounds,
                               "useStreamChat": use_stream_chat}
                await websocket.send(json.dumps(bot_message))
            else:
                print(
                    f"Request failed with status code {response.status_code}")

    except websockets.exceptions.ConnectionClosedOK:
        pass

async def main():
    async with websockets.serve(process_message, "localhost", 8080):
        await asyncio.Future()  # Run forever

asyncio.run(main())
