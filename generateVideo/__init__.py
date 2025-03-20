import azure.functions as func
import logging

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("AI Tutor Function Triggered")

    return func.HttpResponse("AI Tutor is ready!", status_code=200)
