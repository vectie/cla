import argparse
import time
from typing import Optional, List, Tuple, Dict
import requests

import torch
from torch.cuda import get_device_properties
from transformers import AutoModel, AutoTokenizer

# from starlette.requests import Request
# from starlette.responses import StreamingResponse

from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
import ray
from ray import serve
# from ray.serve import serve
import asyncio

# parser = argparse.ArgumentParser()
# parser.add_argument("--port", type=int, default="8000")
# parser.add_argument("--model-path", type=str, default="THUDM/chatglm-6b")
# parser.add_argument("--precision", type=str, help="evaluate at this precision",
#                     choices=["fp32", "fp16", "int4", "int8"])
# parser.add_argument("--listen", action='store_true',
#                     help="listen 0.0.0.0, allowing to respond to network requests")
# parser.add_argument("--cpu", action='store_true', help="use cpu")
# parser.add_argument("--device-id", type=str,
#                     help="select the default CUDA device to use", default=None)


class Options:
    def __init__(self, port, model_path, precision, listen, cpu, device_id):
        self.port = port
        self.model_path = model_path
        self.precision = precision
        self.listen = listen
        self.cpu = cpu
        self.device_id = device_id


cmd_opts = Options(
    port=8000,
    # "THUDM/chatglm-6b",
    model_path="/home/jiaanguo/codespace/js/emerge-app/models/chatglm_model",
    precision="int4",  # "fp32",
    listen=True,
    cpu=False,
    device_id=None
)


# 1: Define a FastAPI app and wrap it in a deployment with a route handler.
app = FastAPI()


@serve.deployment(route_prefix="/", ray_actor_options={"num_gpus": 1})
@serve.ingress(app)
class ChatbotModelDeployment:

    def _load_model(self, cmd_opts=cmd_opts):
        # load tokenizer and model
        tokenizer = AutoTokenizer.from_pretrained(
            cmd_opts.model_path, trust_remote_code=True)
        model = AutoModel.from_pretrained(
            cmd_opts.model_path, trust_remote_code=True)

        # load model with precision
        if cmd_opts.cpu:
            if cmd_opts.precision == "fp32":
                model = model.float()
            elif cmd_opts.precision == "bf16":
                model = model.bfloat16()
            else:
                model = model.float()
        else:
            if cmd_opts.precision is None:
                total_vram_in_gb = get_device_properties(0).total_memory / 1e9
                print(f'GPU memory: {total_vram_in_gb:.2f} GB')

                if total_vram_in_gb > 30:
                    cmd_opts.precision = 'fp32'
                elif total_vram_in_gb > 13:
                    cmd_opts.precision = 'fp16'
                elif total_vram_in_gb > 10:
                    cmd_opts.precision = 'int8'
                else:
                    cmd_opts.precision = 'int4'

                print(f'Choosing precision {cmd_opts.precision} according to your VRAM.'
                      f' If you want to decide precision yourself,'
                      f' please add argument --precision when launching the application.')

            if cmd_opts.precision == "fp16":
                model = model.half().cuda()
            elif cmd_opts.precision == "int4":
                model = model.half().quantize(4).cuda()
            elif cmd_opts.precision == "int8":
                model = model.half().quantize(8).cuda()
            elif cmd_opts.precision == "fp32":
                model = model.float()

        # load model in eval mode
        model = model.eval()

        return model, tokenizer

    def __init__(self):
        self._model, self._tokenizer = self._load_model()

    def _infer(self, query,
               history: Optional[List[Tuple]],
               max_length, top_p, temperature, use_stream_chat: bool):
        # Define the function to generate a response given a query
        if not self._model:
            raise "Model not loaded"

        if history is None:
            history = []

        output_pos = 0
        try:
            if use_stream_chat:
                for output, history in self._model.stream_chat(
                        self._tokenizer, query=query, history=history,
                        max_length=max_length,
                        top_p=top_p,
                        temperature=temperature
                ):
                    print(output[output_pos:], end='', flush=True)
                    old_output_pos = output_pos
                    output_pos = len(output)
                    yield output[old_output_pos:]+'\n'  # output[output_pos:]
                    time.sleep(0.1)
            else:
                output, history = self._model.chat(
                    self._tokenizer, query=query, history=history,
                    max_length=max_length,
                    top_p=top_p,
                    temperature=temperature
                )

                # print(output)
                yield output+'\n'

        except Exception as e:
            print(f"Generation failed: {repr(e)}")

        # Free up GPU memory
        if torch.cuda.is_available():
            device = torch.device(
                f"cuda:{cmd_opts.device_id}" if cmd_opts.device_id is not None else "cuda")
            with torch.cuda.device(device):
                torch.cuda.empty_cache()
                torch.cuda.ipc_collect()

    def _predict(self, query, max_length, top_p, temperature, use_stream_chat):
        # Define the function to handle HTTP requests and generate responses
        responses = []

        for output in self._infer(
            query=query,
            history=None,  # ctx.history,
            max_length=max_length,
            top_p=top_p,
            temperature=temperature,
            use_stream_chat=use_stream_chat
        ):
            responses.append(output.strip())
            print(output)

        # Return the response as a JSON object
        return {"response": responses}

    # FastAPI will automatically parse the HTTP request for us.
    @app.post("/")
    async def query(self, request: Request):
        data = await request.json()
        query = data.get("query", "")
        max_length = data.get("max_length", 2048)
        top_p = data.get("top_p", 0.9)
        temperature = data.get("temperature", 0.7)
        use_stream_chat = data.get("use_stream_chat", True)
        # return self._predict(query, max_length, top_p,
        #                      temperature, use_stream_chat)

        output = self._infer(query, None, max_length, top_p,
                             temperature, use_stream_chat)
        return StreamingResponse(output, media_type="text/plain")
        # headers={"Content-Type": "text/plain", "Transfer-Encoding": "chunked"})


chatbot_model_deployment = ChatbotModelDeployment.bind()

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug")

# @app.post("/")
# async def get_streamed_output(request: Request):
#     return await chatbot_model_deployment(request)

# 2: Deploy the deployment.
# serve.run(ChatbotModelDeployment.bind())


# 3: Query the deployment and print the result.
# print(requests.get("http://localhost:8000/",
#       params={"query": "What is transformer?"}).json())

# if __name__ == '__main__':
#     # parse command line arguments
#     cmd_opts = load_args()

#     # load model
#     model, tokenizer = load_model(cmd_opts)
#     predict(model, tokenizer, "What is transformer",
#             max_length=2048, top_p=0.9,
#             temperature=0.7, use_stream_chat=True)

# 4: Start up the server
# serve run serve_deployment:chatbot_model_deployment

# 5: Send query with command line
# curl -X POST -H "Content-Type: application/json"
# -d '{"query": "What is transformer?", "max_length": 2048,
# "top_p": 0.9, "temperature": 0.7, "use_stream_chat": true}'
# localhost:8000/
