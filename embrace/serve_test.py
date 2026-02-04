import requests
import json


def main():
    url = "http://localhost:8000/"
    data = {
        "query": "What is the meaning of life?",
        "max_length": 2048,
        "top_p": 0.9,
        "temperature": 0.7,
        "use_stream_chat": True
    }

    headers = {
        "Content-Type": "application/json"
    }

    with requests.post(url, data=json.dumps(data), headers=headers, stream=True) as response:
        for chunk in response.iter_content(chunk_size=None):
            print(chunk.decode(), end='')


if __name__ == "__main__":
    main()
