import boto3
import os
import requests

# 🧭 התיקייה שבה יישמרו כל ה-ZIPים
OUTPUT_DIR = "downloaded_lambdas"
os.makedirs(OUTPUT_DIR, exist_ok=True)

client = boto3.client("lambda", region_name="us-east-1")

# מביא את כל שמות הפונקציות
paginator = client.get_paginator("list_functions")
pages = paginator.paginate()

for page in pages:
    for fn in page["Functions"]:
        fn_name = fn["FunctionName"]
        print(f"📥 Downloading: {fn_name}")

        # מביא את הקוד של הפונקציה
        code_info = client.get_function(FunctionName=fn_name)
        zip_url = code_info["Code"]["Location"]

        # מוריד את ה-ZIP מה-URL הזמני
        r = requests.get(zip_url)
        if r.status_code == 200:
            out_path = os.path.join(OUTPUT_DIR, f"{fn_name}.zip")
            with open(out_path, "wb") as f:
                f.write(r.content)
            print(f"✅ Saved to {out_path}")
        else:
            print(f"❌ Failed to download {fn_name}")

print("🎉 All done.")
