import os
import time

import fastapi
from fastapi import Depends, HTTPException, status, Request
from fastapi.responses import StreamingResponse

app = fastapi.FastAPI()


def ask_statesman(query: str):
    completion_reason = None
    while not completion_reason or completion_reason == "length":
        for line in range(10):
            completion_reason = f"hello{line}\n"
            current_response = completion_reason
            yield current_response
            time.sleep(0.25)


@app.post("/")
async def request_handler(query: str):
    stream_response = ask_statesman(query)
    return StreamingResponse(stream_response, media_type="text/plain")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8008, log_level="debug")
