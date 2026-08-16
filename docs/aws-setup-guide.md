# AWS Setup Guide for Rakhi Crate

This guide walks you through setting up AWS services for user authentication and data storage. No prior AWS experience needed.

## What You'll Set Up

- **AWS Cognito User Pool** — Handles user sign-up, sign-in, password reset, and email verification
- **AWS Cognito Identity Pool** — Gives your website temporary AWS credentials so it can talk to DynamoDB
- **AWS DynamoDB Table** — Stores user data (cart, orders, wishlist, profile) in the cloud

## Prerequisites

- A credit/debit card (AWS Free Tier won't charge you for small usage)
- About 30 minutes of time

---

## Step 1: Create an AWS Account

1. Go to [https://aws.amazon.com/free](https://aws.amazon.com/free)
2. Click **"Create a Free Account"**
3. Enter your email, set a password, and choose an account name
4. Add your payment details (you won't be charged for Free Tier usage)
5. Complete phone verification
6. Choose the **"Basic Support - Free"** plan

**Free Tier includes:** 50,000 Cognito monthly active users and 25GB DynamoDB storage — more than enough for development.

---

## Step 2: Create a Cognito User Pool

The User Pool is your user directory — it manages accounts and passwords.

1. Go to [AWS Console](https://console.aws.amazon.com) and sign in
2. In the search bar, type **"Cognito"** and click the service
3. Click **"Create user pool"**

### Configure sign-in experience:
4. Under "Cognito user pool sign-in options", select **Email** only
5. Click **Next**

### Configure security requirements:
6. Password policy: Select **"Cognito defaults"** (minimum 8 characters, requires uppercase, lowercase, number, special character)
7. Multi-factor authentication: Select **"No MFA"** (you can enable this later)
8. User account recovery: Keep **"Enable self-service account recovery"** checked, delivery method: **Email only**
9. Click **Next**

### Configure sign-up experience:
10. Keep "Enable self-registration" checked
11. Under "Attribute verification and user account confirmation":
    - Keep "Allow Cognito to automatically send messages to verify and confirm"
    - Attributes to verify: **Email address**
12. Under "Required attributes": Only **email** should be required
13. Click **Next**

### Configure message delivery:
14. Select **"Send email with Cognito"** (free for up to 50 emails/day during development)
15. Click **Next**

### Integrate your app:
16. User pool name: Enter **"RakhiCrateUserPool"**
17. Under "Initial app client":
    - App type: Select **"Public client"**
    - App client name: Enter **"RakhiCrateWebApp"**
    - Client secret: Select **"Don't generate a client secret"** (important for browser apps!)
18. Click **Next**

### Review and create:
19. Review all settings and click **"Create user pool"**

### Copy your values:
20. Click on your new user pool
21. Copy the **User pool ID** (looks like `eu-west-2_aBcDeFgHi`)
22. Go to **"App integration"** tab → scroll to **"App client list"**
23. Copy the **Client ID** (a long alphanumeric string)

---

## Step 3: Create a Cognito Identity Pool

The Identity Pool gives your website temporary AWS credentials.

1. In the Cognito console, click **"Identity pools"** in the left sidebar (or search "Cognito Identity" in AWS search)
2. Click **"Create identity pool"**

### Configure identity pool:
3. Identity pool name: Enter **"RakhiCrateIdentityPool"**
4. Under "Authentication providers":
   - Click the **"Cognito"** tab
   - User Pool ID: Paste the User Pool ID from Step 2
   - App Client ID: Paste the App Client ID from Step 2
5. Click **"Create pool"**

### Set up IAM roles:
6. AWS will ask you to create IAM roles. Click **"Allow"** to create default roles
7. After creation, copy the **Identity Pool ID** (looks like `eu-west-2:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

---

## Step 4: Create a DynamoDB Table

1. In AWS Console, search for **"DynamoDB"** and click the service
2. Click **"Create table"**
3. Settings:
   - Table name: **`RakhiCrateUserData`**
   - Partition key: **`userId`** (String)
   - Sort key: **`sk`** (String)
4. Table settings: Select **"Default settings"** (this uses On-Demand billing — you only pay for what you use)
5. Click **"Create table"**

---

## Step 5: Set Up IAM Permissions

The authenticated role (from Step 3) needs permission to access DynamoDB.

1. Go to **IAM** service (search "IAM" in AWS Console)
2. Click **"Roles"** in the left sidebar
3. Find the role named something like **"Cognito_RakhiCrateIdentityPoolAuth_Role"** (the authenticated role created in Step 3)
4. Click on it, then click **"Add permissions"** → **"Create inline policy"**
5. Click the **"JSON"** tab and paste this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:YOUR_REGION:YOUR_ACCOUNT_ID:table/RakhiCrateUserData",
      "Condition": {
        "ForAllValues:StringEquals": {
          "dynamodb:LeadingKeys": ["${cognito-identity.amazonaws.com:sub}"]
        }
      }
    }
  ]
}
```

6. Replace `YOUR_REGION` with your region (e.g., `eu-west-2`)
7. Replace `YOUR_ACCOUNT_ID` with your 12-digit AWS account ID (find it in the top-right dropdown)
8. Click **"Review policy"**, name it **"RakhiCrateDynamoAccess"**, then **"Create policy"**

**What this does:** Users can only read/write their own data in DynamoDB (row-level security).

---

## Step 6: Configure CORS (for Local Development)

Cognito handles CORS automatically for standard authentication flows. No additional configuration is needed for `localhost:3000`.

If you deploy to a custom domain later, add it to the User Pool's "App client settings" → "Allowed callback URLs".

---

## Step 7: Copy Values into Your `.env` File

1. In your project root, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in the values you collected:
   ```env
   VITE_AWS_REGION=eu-west-2
   VITE_AWS_USER_POOL_ID=eu-west-2_aBcDeFgHi
   VITE_AWS_USER_POOL_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j
   VITE_AWS_IDENTITY_POOL_ID=eu-west-2:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   VITE_AWS_DYNAMO_TABLE_NAME=RakhiCrateUserData
   ```

---

## Step 8: Test the Connection

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser
3. Open browser DevTools (F12) → Console tab
4. You should see: **"AWS initialized successfully!"**
5. Try creating an account — you'll receive a real verification email!

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "AWS initialized successfully!" not showing | Check that all `VITE_AWS_*` values are filled in `.env` and restart the dev server |
| Sign-up works but verification email not received | Check spam folder. Cognito's free email sender has a 50/day limit |
| "Access Denied" errors on DynamoDB | Check the IAM policy is attached to the correct role and the region/account ID are correct |
| App works fine without `.env` values | That's the fallback demo mode — localStorage is being used instead |

---

## Cost Estimate (Free Tier)

| Service | Free Tier | Typical Dev Usage |
|---------|-----------|-------------------|
| Cognito | 50,000 MAU | Well within free tier |
| DynamoDB | 25 GB storage, 25 read/write units | Well within free tier |
| Identity Pool | No additional charge | Free |

You won't be charged anything during development. The Free Tier lasts 12 months for most services.

---

## Next Steps

- **Going to production?** Enable MFA, set up a custom email sender (SES), and add a custom domain
- **Need more storage?** DynamoDB scales automatically — no changes needed in code
- **Want social login?** Add Google/Facebook as identity providers in the User Pool settings
