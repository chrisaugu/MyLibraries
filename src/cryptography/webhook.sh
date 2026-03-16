#!/bin/bash
set -euo pipefail

BASE_URL="http://localhost:3000"
# Define the payload
payload='{"event":"user.created","data":{"id":"1","full_name":"Faizan","email":"faizan.ahmad.info@gmail.com","contact":"+923338184261"}}'

# Generate the current Unix timestamp
timestamp=$(date +%s)

# Define the webhook shared token
webhook_token='your_shared_webhook_token'

# Define the shared secret
shared_secret='your_shared_secret'

# Generate the HMAC SHA-256 signature in hexadecimal format
signature=$(echo -n "$payload$timestamp" | openssl dgst -sha256 -hmac "$shared_secret" | sed 's/^.* //')

# 1) Receive a webhook (simple POST)
# curl -i "$BASE_URL/webhook" \
#   -H 'Content-Type: application/json' \
#   -d '{"hello":"world"}'

# # 2) Create a webhook in MongoDB
# curl -i "$BASE_URL/webhooks" \
#   -H 'Content-Type: application/json' \
#   -d '{
#     "url":"http://localhost:3001/webhook",
#     "headers":{"X-Test":"true"},
#     "events":["user.created","order.paid"],
#     "secret":"optional-secret",
#     "description":"local test webhook"
#   }'

# 3) List all webhooks
# curl -i "$BASE_URL/webhooks"

# # 4) Get one webhook by ID
# curl -i "$BASE_URL/webhooks/<WEBHOOK_ID>"

# 5) Update a webhook by ID
# curl -i -X PUT "$BASE_URL/webhooks/69b4e6087024bec2085ac0e6" \
#   -H 'Content-Type: application/json' \
#   -d '{
#     "url": "http://localhost:3002/webhook",
#     "clientId":"abc123", 
#     "description":"updated description",
#     "isActive":false
#   }'

# # 6) Delete a webhook by ID
# curl -i -X DELETE "$BASE_URL/webhooks/<WEBHOOK_ID>"

# # 7) Create a webhook in MongoDB
# curl -i "$BASE_URL/register-webhook" \
#   -H 'Content-Type: application/json' \
#   -d '{
#     "url":"http://localhost:3001/webhook",
#     "headers":{"X-Test":"true"},
#     "events":["user.created","order.paid"],
#     "secret":"optional-secret",
#     "description":"local test webhook"
#   }'

# # 8) Trigger subscribed webhooks for an event
# curl -i "$BASE_URL/trigger-event" \
#   -H 'Content-Type: application/json' \
#   -d '{
#     "event":"payment.cancelled",
#     "data":{"id":"123","email":"test@example.com"}
#   }'

# 9) Trigger subscribed webhooks for an event
curl -i "$BASE_URL/generate-event" \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Basic <api_authorization_token>' \
  -H 'X-API-Key: Basic <api_authorization_token>' \
  -d '{
    "clientId": "abc123",
    "event":"user.created",
    "data":{"id":"123","email":"test@example.com"}
  }'

    # "event":"payment.cancelled",
    # "event":"order.cancelled",



# Print the generated signature
# echo "Payload: $payload"
# echo "Webhook Token: $webhook_token"
# echo "Shared Secret: $shared_secret"
# echo "Generated timestamp: $timestamp"
# echo "Generated signature: $signature"

# # Send the payload with the signature and timestamp to the webhook
# curl -i -X POST "$BASE_URL/webhook" \
#   -H "Content-Type: application/json" \
#   -H "x-signature: $signature" \
#   -H "x-webhook-token: $webhook_token" \
#   -H "x-timestamp: $timestamp" \
#   -d "$payload" 

# curl -i -X POST 'https://api.realtime.nuku.app/v2/webhooks' \
#   -H 'Authorization: Basic <api_authorization_token>' \
#   -H 'Content-Type: application/json' \
#   -d '{
#     "name": "All events webhook",
#     "url": "<your endpoint here>",
#     "events": [
#       "meeting.started",
#       "meeting.ended",
#       "meeting.participantJoined",
#       "meeting.participantLeft",
#       "recording.statusUpdate",
#       "livestreaming.statusUpdate"
#     ]
#   }'