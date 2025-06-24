import boto3
import json
from boto3.dynamodb.conditions import Attr

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("StudentSession")

def lambda_handler(event, context):
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400"
    }
    
    if event.get('httpMethod') == 'OPTIONS':
        return {
            "statusCode": 200,
            "headers": headers,
            "body": ""
        }

    try:
        if "body" in event:
            if isinstance(event["body"], str):
                body = json.loads(event["body"])
            else:
                body = event["body"]
        else:
            body = event  # אם אין body, הפרמטרים יכולים להיות ישירות ב-event
    except (json.JSONDecodeError, TypeError):
        return {
            "statusCode": 400,
            "headers": headers,
            "body": json.dumps({"error": "Invalid or missing JSON body"})
        }
        
    start_date = body.get("startDate")
    end_date = body.get("endDate")
    
    # המרת includeTop5 ו-includeInactive לערכים בוליאניים
    include_top5 = str(body.get("includeTop5", "false")).lower() == "true"
    include_inactive = str(body.get("includeInactive", "false")).lower() == "true"

    if not start_date or not end_date:
        return {
            "statusCode": 400,
            "headers": headers,
            "body": json.dumps({"error": "Missing startDate or endDate"})
        }

    try:
        response = table.scan(
            FilterExpression=Attr("Timestamp").between(start_date, end_date)
        )
        items = response.get("Items", [])
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"error": f"DynamoDB error: {str(e)}"})
        }

    result = {"range": {"start": start_date, "end": end_date}}

    # מיפוי לפי אימייל
    email_counts = {}
    for item in items:
        email = item.get("StudentEmail")
        if email:
            email_counts[email] = email_counts.get(email, 0) + 1

    if include_top5:
        top5 = sorted(email_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        result["top5"] = [{"email": email, "count": count} for email, count in top5]

    if include_inactive:
        inactive = [
            {"email": email, "count": count}
            for email, count in email_counts.items()
            if count < 5
        ]
        result["inactiveUsers"] = inactive

    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps(result)
    }