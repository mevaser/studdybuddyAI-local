import os
import uuid
import pandas as pd
import openai
from pinecone import Pinecone
from dotenv import load_dotenv
import tiktoken

load_dotenv()

# הגדרות קבועות
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
OPENAI_API_KEY = os.getenv("api_key")
INDEX_NAME = "studybuddy-memory"

openai.api_key = OPENAI_API_KEY
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(INDEX_NAME)

# המרת טקסט לווקטור
def get_embedding(text):
    response = openai.Embedding.create(
        input=text,
        model="text-embedding-ada-002"
    )
    return response['data'][0]['embedding']

# טעינת קובץ ה-CSV
csv_path = "selected_fixed.csv"  # תעדכן אם צריך
df = pd.read_csv(csv_path, encoding="utf-8-sig")

# ספירת סה"כ
total_rows = len(df)
uploaded = 0
skipped = 0
errors = 0

print(f"\n🚀 מתחיל תהליך העלאה של {total_rows} שורות לפיינקון...\n")

# מעבר על כל שורה והעלאה לפיינקון
for idx, (_, row) in enumerate(df.iterrows(), start=1):
    try:
        email = str(row["StudentEmail"])
        name = str(row["StudentName"])
        question = str(row["StudentPrompt"])
        answer = str(row["AIAnswer"])
        topic = str(row["topic"])
        subtopic = str(row["subtopic"])
        timestamp = str(row["Timestamp"])

        full_text = f"שאלה: {question}\nתשובה: {answer}"
        vector_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, email + timestamp))

        # בדיקה אם קיים כבר
        existing = index.fetch(ids=[vector_id], namespace="default").vectors
        if vector_id in existing:
            print(f"[{idx}/{total_rows}] ✔ רשומה קיימת (ID: {vector_id}), מדלג.")
            skipped += 1
            continue

        embedding = get_embedding(full_text)

        index.upsert(
            vectors=[
                {
                    "id": vector_id,
                    "values": embedding,
                    "metadata": {
                        "email": email,
                        "name": name,
                        "question": question,
                        "answer": answer,
                        "topic": topic,
                        "subtopic": subtopic,
                        "timestamp": timestamp
                    }
                }
            ],
            namespace="default"
        )
        print(f"[{idx}/{total_rows}] ⬆ רשומה הועלתה (ID: {vector_id})")
        uploaded += 1

    except Exception as e:
        print(f"[{idx}/{total_rows}] ⚠ שגיאה בשורה {idx}: {e}")
        errors += 1

# דוח מסכם
print("\n📊 סיכום תהליך:")
print(f"סה\"כ שורות בקובץ: {total_rows}")
print(f"רשומות חדשות שהועלו: {uploaded}")
print(f"רשומות שדלגו עליהן (כבר קיימות): {skipped}")
print(f"שגיאות: {errors}")
print("\n✅ סיום תהליך.")
