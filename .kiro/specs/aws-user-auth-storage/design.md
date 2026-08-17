# Technical Design Document

## Introduction

This document describes the technical architecture for migrating the Rakhi Crate application from Firebase (Auth + Firestore) to AWS (Cognito + DynamoDB). The design preserves the existing `dbService` interface so that no component-level code changes are required. It introduces two new modules (`src/aws-config.ts` and a rewritten `src/dbService.ts`) and adds a Cognito Identity Pool to grant the frontend temporary AWS credentials for DynamoDB access.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Frontend                            │
│                                                                 │
│  ┌──────────────┐    ┌──────────────────┐    ┌──────────────┐  │
│  │  Components  │───▶│    dbService      │◀───│  App.tsx      │  │
│  │  (unchanged) │    │  (same interface) │    │  (unchanged)  │  │
│  └──────────────┘    └────────┬─────────┘    └──────────────┘  │
│                               │                                 │
│                    ┌──────────┴──────────┐                      │
│                    │   aws-config.ts      │                      │
│                    │  (Amplify + SDK)     │                      │
│                    └──────────┬──────────┘                      │
└───────────────────────────────┼─────────────────────────────────┘
                                │
                 ┌──────────────┼──────────────┐
                 │              │              │
          ┌──────▼──────┐ ┌────▼─────┐ ┌─────▼──────┐
          │   Cognito    │ │ Identity │ │  DynamoDB   │
          │  User Pool   │ │   Pool   │ │   Table     │
          │  (auth)      │ │ (creds)  │ │  (data)     │
          └─────────────┘ └──────────┘ └────────────┘
```

### Key Design Decisions

1. **AWS Amplify Auth v6** for Cognito — lightweight, tree-shakeable, handles token refresh automatically
2. **@aws-sdk/lib-dynamodb** (Document Client) for DynamoDB — provides native JS object marshalling
3. **Cognito Identity Pool** — exchanges Cognito JWT for temporary AWS credentials, enabling direct DynamoDB access from the browser without a backend
4. **Single-table DynamoDB design** — all user data (cart, orders, wishlist, profile) in one table using composite sort keys
5. **Same dbService interface** — zero changes needed in components

## Module Design

### 1. `src/aws-config.ts` (new — replaces `src/firebase.ts`)

```typescript
// Environment variables
const awsConfig = {
  region: import.meta.env.VITE_AWS_REGION,
  userPoolId: import.meta.env.VITE_AWS_USER_POOL_ID,
  userPoolClientId: import.meta.env.VITE_AWS_USER_POOL_CLIENT_ID,
  identityPoolId: import.meta.env.VITE_AWS_IDENTITY_POOL_ID,
  dynamoTableName: import.meta.env.VITE_AWS_DYNAMO_TABLE_NAME,
};

const isAwsConfigured: boolean = !!(
  awsConfig.region &&
  awsConfig.userPoolId &&
  awsConfig.userPoolClientId
);

// Amplify Auth configuration (lazy init)
// DynamoDB Document Client (lazy init with Cognito credentials)

export { awsConfig, isAwsConfigured };
```

**Responsibilities:**
- Read all `VITE_AWS_*` environment variables
- Initialize AWS Amplify Auth with Cognito User Pool config
- Create DynamoDB Document Client using Cognito Identity Pool credentials
- Export `isAwsConfigured` flag for fallback logic

### 2. `src/dbService.ts` (rewritten — same exports)

The module retains the exact same exported interface:

| Method | Auth/Data | AWS Service |
|--------|-----------|-------------|
| `signInAnonymously()` | Auth | Cognito (guest access via Identity Pool) |
| `signInWithEmail(email, password)` | Auth | Cognito `signIn` |
| `signUpWithEmail(email, password)` | Auth | Cognito `signUp` |
| `signOut()` | Auth | Cognito `signOut` |
| `onAuthStateChanged(callback)` | Auth | Amplify Hub listener |
| `saveOrder(order)` | Data | DynamoDB `PutCommand` |
| `getOrders()` | Data | DynamoDB `QueryCommand` |
| `subscribeToOrders(callback)` | Data | DynamoDB polling (3s interval) |
| `saveCart(cart, userId)` | Data | DynamoDB `PutCommand` |
| `getCart(userId)` | Data | DynamoDB `GetCommand` |

**Fallback behaviour:** When `isAwsConfigured === false`, all methods use localStorage (identical to current demo mode).

### 3. `docs/aws-setup-guide.md` (new)

Step-by-step guide for beginners covering:
1. Creating an AWS account
2. Creating a Cognito User Pool
3. Creating a Cognito Identity Pool
4. Creating a DynamoDB table
5. Setting up IAM policies
6. Configuring environment variables

## Data Model — DynamoDB Single-Table Design

**Table Name:** `RakhiCrateUserData`

| Partition Key (PK) | Sort Key (SK) | Attributes |
|---|---|---|
| `userId` | `PROFILE#info` | email, displayName, createdAt |
| `userId` | `CART#current` | items (CartItem[]), updatedAt |
| `userId` | `ORDER#<orderId>` | Full Order object, createdAt |
| `userId` | `WISHLIST#<itemId>` | WishlistItem object |

### Access Patterns

| Access Pattern | Key Condition | Operation |
|---|---|---|
| Get user profile | PK = userId, SK = `PROFILE#info` | GetItem |
| Get/save cart | PK = userId, SK = `CART#current` | GetItem / PutItem |
| Save order | PK = userId, SK = `ORDER#<id>` | PutItem |
| List all orders | PK = userId, SK begins_with `ORDER#` | Query |
| Add wishlist item | PK = userId, SK = `WISHLIST#<id>` | PutItem |
| Remove wishlist item | PK = userId, SK = `WISHLIST#<id>` | DeleteItem |
| List all wishlist | PK = userId, SK begins_with `WISHLIST#` | Query |

### DynamoDB Table Configuration

- **Billing Mode:** PAY_PER_REQUEST (on-demand) — no capacity planning needed
- **Partition Key:** `userId` (String)
- **Sort Key:** `sk` (String)
- **No GSIs needed** for current access patterns (all queries are per-user)

## Authentication Flow

### Sign-Up Flow

```
User → signUpWithEmail(email, pwd)
  → Amplify Auth.signUp({ username: email, password })
    → Cognito sends verification code to email
User → confirmSignUp(email, code)
  → Amplify Auth.confirmSignUp({ username: email, confirmationCode })
    → Account confirmed
  → Auto sign-in → onAuthStateChanged fires with user
```

### Sign-In Flow

```
User → signInWithEmail(email, pwd)
  → Amplify Auth.signIn({ username: email, password })
    → Cognito returns JWT tokens (id, access, refresh)
    → Amplify stores tokens in memory, auto-refreshes
    → Identity Pool exchanges ID token for AWS credentials
  → onAuthStateChanged fires with authenticated user
  → getCart(userId) loads cart from DynamoDB
```

### Sign-Out Flow

```
User → signOut()
  → Amplify Auth.signOut()
    → Clears tokens from memory
    → Revokes refresh token
  → onAuthStateChanged fires with guest user
  → App falls back to localStorage
```

### Auth State Observation

```typescript
// Uses Amplify Hub to listen for auth events
Hub.listen('auth', ({ payload }) => {
  switch (payload.event) {
    case 'signedIn': // fire callback with user
    case 'signedOut': // fire callback with guest
    case 'tokenRefresh_failure': // fire callback with guest
  }
});
```

## Security Considerations

### IAM Policy for Identity Pool (Authenticated Role)

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
      "Resource": "arn:aws:dynamodb:REGION:ACCOUNT:table/RakhiCrateUserData",
      "Condition": {
        "ForAllValues:StringEquals": {
          "dynamodb:LeadingKeys": ["${cognito-identity.amazonaws.com:sub}"]
        }
      }
    }
  ]
}
```

This ensures users can only access their own data partition.

### IAM Policy for Identity Pool (Unauthenticated Role)

No DynamoDB access — guest users use localStorage only.

### Frontend Security

- No AWS secret keys in the frontend code
- Cognito User Pool Client configured with NO client secret (public client for SPAs)
- Tokens stored in memory only (not localStorage) by Amplify default
- Identity Pool maps Cognito sub → DynamoDB partition key to enforce row-level access

## Environment Variables

```env
# AWS Cognito
VITE_AWS_REGION=eu-west-2
VITE_AWS_USER_POOL_ID=eu-west-2_xxxxxxxxx
VITE_AWS_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_AWS_IDENTITY_POOL_ID=eu-west-2:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# AWS DynamoDB
VITE_AWS_DYNAMO_TABLE_NAME=RakhiCrateUserData
```

## Dependencies (package.json additions)

```json
{
  "aws-amplify": "^6.x",
  "@aws-sdk/client-dynamodb": "^3.x",
  "@aws-sdk/lib-dynamodb": "^3.x",
  "@aws-sdk/credential-providers": "^3.x"
}
```

**Removed:**
```json
{
  "firebase": "^12.16.0"
}
```

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/aws-config.ts` | CREATE | AWS Amplify + DynamoDB client init |
| `src/dbService.ts` | REWRITE | Same interface, AWS backend |
| `src/firebase.ts` | DELETE | No longer needed |
| `.env.example` | UPDATE | Replace Firebase vars with AWS vars |
| `docs/aws-setup-guide.md` | CREATE | Step-by-step AWS setup for beginners |
| `package.json` | UPDATE | Add AWS SDKs, remove Firebase |
| `src/App.tsx` | MODIFY | Change import from `firebase` to `aws-config` |

## Testing Strategy

1. **Demo mode testing** — Verify app works without AWS config (localStorage fallback)
2. **Integration testing** — Test with real Cognito User Pool and DynamoDB table
3. **Auth flow testing** — Sign up → verify → sign in → sign out cycle
4. **Data persistence testing** — Cart, orders, wishlist CRUD operations
5. **Token refresh testing** — Verify session persists across page reloads
6. **Error handling testing** — Network failures, expired tokens, invalid credentials
