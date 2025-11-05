#!/bin/bash
set -e

REGION="us-east-1"
PROJECT="moodify"

echo "🔐 Creating AWS Secrets..."

# Read from env.example.txt (update these values)
DATABASE_URL="postgresql://postgres:Moodify@dmin123@db.gsjwtbmiqmgvibvilwfr.supabase.co:5432/postgres"
NEXTAUTH_SECRET="rhTww5kBSJJ1pKm0V81G/vhdjLK+Rp//YoNzQ+KIjww="
NEXTAUTH_URL="http://moodify-prod-alb-1750063927.us-east-1.elb.amazonaws.com"
SPOTIFY_CLIENT_ID="b1fd1c9e752943288a4b5a941ccc5bca"
SPOTIFY_CLIENT_SECRET="f1c05bd77dc54ff7b9c01c3027f93e81"

# Create/update secrets
for secret in \
  "$PROJECT/database-url:$DATABASE_URL" \
  "$PROJECT/nextauth-secret:$NEXTAUTH_SECRET" \
  "$PROJECT/nextauth-url:$NEXTAUTH_URL" \
  "$PROJECT/spotify-client-id:$SPOTIFY_CLIENT_ID" \
  "$PROJECT/spotify-client-secret:$SPOTIFY_CLIENT_SECRET"
do
  NAME=$(echo $secret | cut -d: -f1)
  VALUE=$(echo $secret | cut -d: -f2-)
  
  echo "Creating $NAME..."
  aws secretsmanager create-secret \
    --name "$NAME" \
    --secret-string "$VALUE" \
    --region $REGION 2>/dev/null || \
  aws secretsmanager update-secret \
    --secret-id "$NAME" \
    --secret-string "$VALUE" \
    --region $REGION
done

echo "✅ All secrets created!"
