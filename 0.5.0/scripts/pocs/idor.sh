#!/usr/bin/env bash
# PoC: IDOR demonstration using X-Demo-UserId header
# Assumes server is running and seed data exists.
# Replace SOFTWARE_ID, OWNER_ID, OTHER_ID with actual values from your DB/seed.

BASE=http://localhost:3000/api/v1/software
# Example values (adjust as needed)
SOFTWARE_ID=PUT_SOFTWARE_ID_HERE
OWNER_ID=PUT_OWNER_ID_HERE
OTHER_ID=some-other-user-id

if [ "$SOFTWARE_ID" = "PUT_SOFTWARE_ID_HERE" ]; then
  echo "Please edit this script and set SOFTWARE_ID and OWNER_ID to real values from the seed."
  exit 1
fi

echo "=== Request as owner (should succeed) ==="
curl -s -H "X-Demo-UserId: ${OWNER_ID}" "${BASE}/${SOFTWARE_ID}" | jq '. '

echo "\n=== Request as different user (should be 403 FORBIDDEN) ==="
curl -s -H "X-Demo-UserId: ${OTHER_ID}" "${BASE}/${SOFTWARE_ID}" | jq '. '

# If you pass -H "Authorization: Bearer <token>" instead of the demo header,
# the behavior will be the same because the server authorizes based on token user id.
