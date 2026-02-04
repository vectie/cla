import httpcore
import json
import asyncio


async def main():
    url = b"http://localhost:8000/your-endpoint"
    data = {
        "key": "value",
    }

    headers = [
        (b"Content-Type", b"application/json"),
        (b"Host", b"localhost:8000"),
        (b"Accept", b"*/*"),
    ]

    async with httpcore.AsyncConnectionPool() as http:
        request_body = json.dumps(data).encode("utf-8")
        method = b"POST"
        scheme = b"http"
        authority = b"localhost:8000"
        full_path = b"/your-endpoint"

        response = await http.request(method, url)

        status_code, response_headers, response_stream = response
        async for chunk in response_stream:
            print(chunk.decode("utf-8"), end="")
            await response_stream.aclose()

if __name__ == "__main__":
    asyncio.run(main())
