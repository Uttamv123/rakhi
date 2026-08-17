# Tasks

## Task 1: Install AWS dependencies and update package.json
- [x] Install `aws-amplify` package (^6.x)
- [x] Install `@aws-sdk/client-dynamodb` package (^3.x)
- [x] Install `@aws-sdk/lib-dynamodb` package (^3.x)
- [x] Install `@aws-sdk/credential-providers` package (^3.x)
- [x] Remove `firebase` package from dependencies
- [x] Verify the project builds without errors after dependency changes

**Requirements:** Req 11 (AWS SDK Integration), Req 14 (Firebase Dependency Removal)

## Task 2: Create AWS configuration module (`src/aws-config.ts`)
- [x] Create `src/aws-config.ts` file
- [x] Read environment variables: `VITE_AWS_REGION`, `VITE_AWS_USER_POOL_ID`, `VITE_AWS_USER_POOL_CLIENT_ID`, `VITE_AWS_IDENTITY_POOL_ID`, `VITE_AWS_DYNAMO_TABLE_NAME`
- [x] Export `awsConfig` object with all config values
- [x] Export `isAwsConfigured` boolean that checks if required env vars are present
- [x] Configure Amplify Auth with Cognito User Pool settings (lazy initialization)
- [x] Create and export a DynamoDB Document Client factory function that uses Cognito Identity Pool credentials
- [x] Add console log indicating successful AWS initialization (matching Firebase pattern)

**Requirements:** Req 1 (Cognito Setup), Req 11 (AWS SDK Integration)
**Depends on:** Task 1

## Task 3: Rewrite `src/dbService.ts` — Authentication methods
- [x] Replace Firebase auth imports with Amplify Auth imports (`signIn`, `signUp`, `signOut`, `confirmSignUp`, `resetPassword`, `confirmResetPassword`, `getCurrentUser`, `fetchAuthSession`)
- [x] Implement `signInAnonymously()` — return guest user object when not configured, use Identity Pool unauthenticated access when configured
- [x] Implement `signInWithEmail(email, password)` — call Amplify `signIn`, handle `UserNotFoundException`, `NotAuthorizedException`, `UserNotConfirmedException` errors with user-friendly messages
- [x] Implement `signUpWithEmail(email, password)` — call Amplify `signUp`, handle `UsernameExistsException` error
- [x] Implement `signOut()` — call Amplify `signOut`, clear state, notify listeners with guest user
- [x] Implement `onAuthStateChanged(callback)` — use Amplify Hub `auth` channel listener for `signedIn`, `signedOut`, `tokenRefresh_failure` events; fire immediately with current session state on subscribe
- [x] Maintain localStorage fallback for all auth methods when `isAwsConfigured === false`
- [x] Preserve exact same method signatures and return types

**Requirements:** Req 1-6 (All auth requirements), Req 12 (dbService migration)
**Depends on:** Task 2

## Task 4: Rewrite `src/dbService.ts` — Data persistence methods (Cart)
- [x] Import DynamoDB Document Client from `aws-config.ts`
- [x] Implement `saveCart(cart, userId)` — use `PutCommand` with PK=`userId`, SK=`CART#current`, store full cart array and updatedAt timestamp
- [x] Implement `getCart(userId)` — use `GetCommand` with PK=`userId`, SK=`CART#current`, return CartItem array
- [x] Add error handling: catch DynamoDB errors, fall back to localStorage, log error
- [x] Maintain localStorage-only behaviour when `isAwsConfigured === false` or user is guest

**Requirements:** Req 7 (DynamoDB Design), Req 8 (Cart Persistence), Req 12 (dbService migration)
**Depends on:** Task 3

## Task 5: Rewrite `src/dbService.ts` — Data persistence methods (Orders)
- [x] Implement `saveOrder(order)` — use `PutCommand` with PK=`userId`, SK=`ORDER#<orderId>`, store full Order object with createdAt
- [x] Implement `getOrders()` — use `QueryCommand` with PK=`userId`, SK begins_with `ORDER#`, return orders sorted by createdAt descending
- [x] Implement `subscribeToOrders(callback)` — poll DynamoDB every 3 seconds (matching current Firestore listener behaviour), call callback with updated orders array
- [ ] Add error handling: catch DynamoDB errors, fall back to localStorage, log error
- [x] Maintain localStorage-only behaviour when `isAwsConfigured === false`

**Requirements:** Req 7 (DynamoDB Design), Req 9 (Order Persistence), Req 12 (dbService migration)
**Depends on:** Task 4

## Task 6: Rewrite `src/dbService.ts` — Data persistence methods (Wishlist)
- [x] Add `saveWishlistItem(userId, item)` method — use `PutCommand` with PK=`userId`, SK=`WISHLIST#<itemId>`
- [x] Add `removeWishlistItem(userId, itemId)` method — use `DeleteCommand` with PK=`userId`, SK=`WISHLIST#<itemId>`
- [x] Add `getWishlist(userId)` method — use `QueryCommand` with PK=`userId`, SK begins_with `WISHLIST#`
- [ ] Add error handling: catch DynamoDB errors, fall back to localStorage, log error
- [ ] Maintain localStorage-only behaviour when `isAwsConfigured === false`

**Requirements:** Req 7 (DynamoDB Design), Req 10 (Wishlist Persistence), Req 12 (dbService migration)
**Depends on:** Task 5

## Task 7: Update `src/App.tsx` and component imports
- [x] Replace `import { isFirebaseConfigured } from './firebase'` with `import { isAwsConfigured } from './aws-config'`
- [x] Update any references to `isFirebaseConfigured` → `isAwsConfigured` in App.tsx
- [x] Check all components for direct Firebase imports and update them
- [x] Verify the app compiles without errors

**Requirements:** Req 14 (Firebase Removal)
**Depends on:** Task 6

## Task 8: Delete Firebase module and clean up
- [x] Delete `src/firebase.ts`
- [x] Remove all Firebase-related environment variables from `.env.example`
- [x] Verify no remaining imports from `firebase/*` exist in the codebase
- [x] Run build to confirm zero Firebase references

**Requirements:** Req 14 (Firebase Dependency Removal)
**Depends on:** Task 7

## Task 9: Update `.env.example` with AWS variables
- [x] Add `VITE_AWS_REGION=eu-west-2` with comment
- [x] Add `VITE_AWS_USER_POOL_ID=` with placeholder description
- [x] Add `VITE_AWS_USER_POOL_CLIENT_ID=` with placeholder description
- [x] Add `VITE_AWS_IDENTITY_POOL_ID=` with placeholder description
- [x] Add `VITE_AWS_DYNAMO_TABLE_NAME=RakhiCrateUserData` with comment
- [x] Remove old Firebase `VITE_FIREBASE_*` variables

**Requirements:** Req 13 (Environment Configuration)
**Depends on:** Task 8

## Task 10: Create beginner-friendly AWS setup guide (`docs/aws-setup-guide.md`)
- [x] Write introduction explaining what AWS Cognito and DynamoDB are
- [x] Document step-by-step: Create an AWS account (free tier)
- [x] Document step-by-step: Create a Cognito User Pool (email sign-in, password policy settings)
- [x] Document step-by-step: Create a Cognito App Client (no client secret, for SPA)
- [x] Document step-by-step: Create a Cognito Identity Pool (link to User Pool, set authenticated/unauthenticated roles)
- [x] Document step-by-step: Create a DynamoDB table (`RakhiCrateUserData`, partition key `userId`, sort key `sk`)
- [x] Document step-by-step: Create IAM policy for authenticated role (DynamoDB access with leading key condition)
- [x] Document: Configure CORS for local development
- [x] Document: Copy values into `.env` file
- [x] Document: Test the connection by running `npm run dev`

**Requirements:** Req 13 (Environment Configuration and Setup Guide)
**Depends on:** Task 9

## Task 11: Verify demo mode (no AWS config) still works
- [x] Remove all `VITE_AWS_*` values from `.env` (or use no `.env`)
- [x] Run the application with `npm run dev`
- [x] Verify sign-up, sign-in, sign-out work with localStorage
- [x] Verify cart, orders, and wishlist persist to localStorage
- [x] Verify no AWS-related errors appear in console
- [x] Run `npm run build` to confirm production build succeeds

**Requirements:** Req 1 AC5 (fallback behaviour), Req 8 AC3, Req 9 AC4, Req 10 AC4
**Depends on:** Task 10
