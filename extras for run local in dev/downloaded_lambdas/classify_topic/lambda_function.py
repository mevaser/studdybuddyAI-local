import os
import json
import boto3
from google import genai
from google.genai import types
from google.oauth2 import service_account

LOG_TABLE_NAME    = os.environ.get("LOG_TABLE_NAME", "StudentSession")
AWS_REGION        = os.environ.get("AWS_REGION")
GCP_PROJECT_ID    = os.environ.get("GCP_PROJECT_ID", "studdybuddyaiclassifier")
GCP_REGION        = os.environ.get("GCP_REGION", "global")
MODEL_NAME        = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash-001")
GOOGLE_CRED_PATH  = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", "lambda-gemini-access.json")

credentials = service_account.Credentials.from_service_account_file(
    GOOGLE_CRED_PATH,
    scopes=["https://www.googleapis.com/auth/cloud-platform"]
)
vertex_client = genai.Client(
    vertexai=True,
    credentials=credentials,
    project=GCP_PROJECT_ID,
    location=GCP_REGION,
)

def classify_pair(question: str, answer: str) -> dict:
    user_part = types.Part.from_text(text=f"""
You are an expert AI classifier. Classify the following educational Q&A into JSON with keys "topic" and "subtopic".

StudentPrompt:
\"\"\"{question}\"\"\"
AIAnswer:
\"\"\"{answer}\"\"\"
""")
    instruction = types.Part.from_text(text="""Return exactly a JSON object like:
{"topic":"string","subtopic":"string"}""")

    contents = [
        types.Content(role="user", parts=[user_part]),
        types.Content(role="user", parts=[instruction]),
    ]
    config = types.GenerateContentConfig(
        temperature=0.3,
        max_output_tokens=256,
        response_mime_type="application/json",
        response_schema={
            "type": "object",
            "properties": {
                "topic":    {"type": "string"},
                "subtopic": {"type": "string"}
            },
            "required": ["topic", "subtopic"]
        }
    )

    full_response = ""
    for chunk in vertex_client.models.generate_content_stream(
        model=MODEL_NAME,
        contents=contents,
        config=config
    ):
        full_response += chunk.text

    print("📤 Gemini full response:", full_response)

    try:
        if not full_response.strip():
            print("⚠️ Gemini returned an empty response.")
            return {"topic": "Unclassified", "subtopic": "Unclassified"}

        return json.loads(full_response)
    except json.JSONDecodeError as e:
        print("❌ Gemini returned invalid JSON:", e)
        return {"topic": "Unclassified", "subtopic": "Unclassified"}

def lambda_handler(event, context):
    """
    Handles:
      1) SQS-triggered events: event["Records"] → record["body"] with log_id, question, answer
      2) Direct invoke: event itself with log_id, StudentPrompt/question, AIAnswer/answer
    """
    if event.get("Records"):
        records = event["Records"]
    else:
        records = [{
            "body": json.dumps({
                "log_id": event.get("log_id"),
                "question": event.get("StudentPrompt") or event.get("question"),
                "answer":   event.get("AIAnswer")      or event.get("answer")
            })
        }]

    responses = []
    for record in records:
        try:
            body = json.loads(record["body"])
            question = body["question"]
            answer = body["answer"]

            result = classify_pair(question, answer)
            topic    = result.get("topic", "Unclassified")
            subtopic = result.get("subtopic", "Unclassified")
            print(f"✅ Classifier: {topic} / {subtopic}")

            responses.append({"topic": topic, "subtopic": subtopic})

        except Exception as e:
            print(f"❌ Failed record: {e}")
            responses.append({"topic": "Unclassified", "subtopic": "Unclassified"})

    # Return only the first response for direct invoke, or the list for batch
    return responses[0] if len(responses) == 1 else responses
