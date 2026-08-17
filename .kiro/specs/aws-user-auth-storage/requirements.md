# Requirements Document

## Introduction

This feature replaces the existing Firebase-based authentication and data storage in the Rakhi Crate e-commerce application with AWS services. AWS Cognito will handle user authentication (sign up, sign in, password reset, session management), and AWS DynamoDB will store user-related data (cart, orders, wishlist, user profiles). The existing `dbService` abstraction layer will be re-implemented to use AWS SDKs, ensuring the rest of the application remains largely unchanged. This migration targets a beginner-friendly setup process with clear configuration and environment variable management.

## Glossary

- **Auth_Service**: The AWS Cognito User Pool-based authentication module that manages user sign-up, sign-in, password reset, and session tokens in the Rakhi Crate application
- **Data_Service**: The DynamoDB-based data persistence module that stores and retrieves user carts, orders, wishlists, and profile information
- **User_Pool**: An AWS Cognito User Pool that serves as the user directory for managing accounts and credentials
- **Cognito_Client**: The AWS Amplify Auth library or AWS SDK client configured in the frontend to communicate with the User Pool
- **DynamoDB_Table**: An AWS DynamoDB table used to persist application data with partition and sort key access patterns
- **Session_Token**: A JWT (JSON Web Token) issued by Cognito after successful authentication, used to identify the user in subsequent requests
- **Guest_User**: An unauthenticated visitor browsing the site who has not signed in or registered
- **Authenticated_User**: A user who has completed sign-in and holds a valid Session_Token
- **dbService**: The existing abstraction layer module (`src/dbService.ts`) that provides a unified interface for authentication and data operations

## Requirements

### Requirement 1: AWS Cognito User Pool Setup and Configuration

**User Story:** As a developer, I want to configure an AWS Cognito User Pool with the correct settings, so that the application can manage user accounts securely.

#### Acceptance Criteria

1. THE Auth_Service SHALL use an AWS Cognito User Pool as the sole user authentication backend
2. THE Auth_Service SHALL require email address as the primary sign-in identifier for the User_Pool
3. THE Auth_Service SHALL enforce a minimum password length of 8 characters with at least one uppercase letter, one lowercase letter, and one number for the User_Pool
4. THE Auth_Service SHALL store Cognito configuration values (User Pool ID, Client ID, AWS Region) as environment variables prefixed with `VITE_AWS_`
5. IF the Cognito environment variables are missing, THEN THE Auth_Service SHALL fall back to a local demo mode using localStorage, matching the current fallback behaviour

### Requirement 2: User Sign-Up with Email Verification

**User Story:** As a new customer, I want to create an account with my email and password, so that I can access personalised features like wishlists and order history.

#### Acceptance Criteria

1. WHEN a Guest_User submits a valid email and password, THE Auth_Service SHALL create a new account in the User_Pool
2. WHEN the User_Pool creates a new account, THE Auth_Service SHALL send a verification code to the provided email address
3. WHEN the user submits a valid verification code, THE Auth_Service SHALL confirm the account and transition the user to Authenticated_User state
4. IF the user submits an invalid or expired verification code, THEN THE Auth_Service SHALL display a descriptive error message and allow the user to request a new code
5. IF an account with the submitted email already exists in the User_Pool, THEN THE Auth_Service SHALL display an error message stating the email is already registered

### Requirement 3: User Sign-In

**User Story:** As a returning customer, I want to sign in with my email and password, so that I can access my saved cart, orders, and wishlist.

#### Acceptance Criteria

1. WHEN a Guest_User submits valid email and password credentials, THE Auth_Service SHALL authenticate the user against the User_Pool and issue a Session_Token
2. WHEN the Auth_Service issues a Session_Token, THE Cognito_Client SHALL store the token securely in browser memory and refresh it automatically before expiry
3. IF the submitted email does not exist in the User_Pool, THEN THE Auth_Service SHALL display an error message indicating the account was not found
4. IF the submitted password is incorrect, THEN THE Auth_Service SHALL display an error message indicating invalid credentials
5. IF the user account has not been verified, THEN THE Auth_Service SHALL prompt the user to complete email verification before proceeding

### Requirement 4: Password Reset Flow

**User Story:** As a customer who has forgotten my password, I want to reset it via email, so that I can regain access to my account.

#### Acceptance Criteria

1. WHEN a user requests a password reset with a registered email, THE Auth_Service SHALL send a verification code to that email address
2. WHEN the user submits a valid verification code and a new password meeting the password policy, THE Auth_Service SHALL update the password in the User_Pool
3. IF the verification code is invalid or expired, THEN THE Auth_Service SHALL display a descriptive error message and allow the user to request a new code
4. IF the submitted email is not registered in the User_Pool, THEN THE Auth_Service SHALL display an error stating no account was found for that email

### Requirement 5: User Sign-Out

**User Story:** As an authenticated customer, I want to sign out of my account, so that my session is ended and my data is not accessible to others on the same device.

#### Acceptance Criteria

1. WHEN an Authenticated_User triggers sign-out, THE Auth_Service SHALL revoke the current Session_Token and clear all authentication state from browser memory
2. WHEN sign-out completes, THE Auth_Service SHALL transition the application to Guest_User state
3. WHILE in Guest_User state after sign-out, THE Data_Service SHALL only access locally stored data and not make authenticated requests to DynamoDB

### Requirement 6: Authentication State Observation

**User Story:** As a developer, I want to observe authentication state changes reactively, so that the UI updates automatically when users sign in or out.

#### Acceptance Criteria

1. THE Auth_Service SHALL provide an `onAuthStateChanged` callback mechanism that fires whenever the user's authentication state changes
2. WHEN the application loads, THE Auth_Service SHALL check for an existing valid session and fire the auth state callback with the current user or Guest_User state
3. WHEN a Session_Token expires and cannot be refreshed, THE Auth_Service SHALL fire the auth state callback with Guest_User state

### Requirement 7: DynamoDB Table Design for User Data

**User Story:** As a developer, I want a DynamoDB table structure that supports cart, order, wishlist, and profile data, so that all user data is efficiently stored and retrieved.

#### Acceptance Criteria

1. THE Data_Service SHALL use a single DynamoDB_Table with a partition key of `userId` and a sort key of `dataType#identifier` to store all user-related data
2. THE Data_Service SHALL store cart items with a sort key pattern of `CART#<itemId>`
3. THE Data_Service SHALL store orders with a sort key pattern of `ORDER#<orderId>`
4. THE Data_Service SHALL store wishlist items with a sort key pattern of `WISHLIST#<itemId>`
5. THE Data_Service SHALL store user profile data with a sort key of `PROFILE#info`
6. THE Data_Service SHALL store DynamoDB configuration values (table name, AWS Region) as environment variables prefixed with `VITE_AWS_`

### Requirement 8: Cart Data Persistence

**User Story:** As a customer, I want my shopping cart to be saved to the cloud when I am signed in, so that I can resume shopping across devices.

#### Acceptance Criteria

1. WHILE an Authenticated_User modifies the cart, THE Data_Service SHALL persist the updated cart items to the DynamoDB_Table under the user's `userId` partition
2. WHEN an Authenticated_User signs in, THE Data_Service SHALL retrieve the stored cart from DynamoDB and load it into the application state
3. WHILE in Guest_User state, THE Data_Service SHALL persist cart data to localStorage only
4. IF the DynamoDB write operation fails, THEN THE Data_Service SHALL fall back to saving cart data in localStorage and log the error

### Requirement 9: Order Data Persistence

**User Story:** As a customer, I want my completed orders stored securely in the cloud, so that I can view my order history from any device.

#### Acceptance Criteria

1. WHEN a new order is placed, THE Data_Service SHALL write the Order record to the DynamoDB_Table under the user's `userId` partition with the sort key `ORDER#<orderId>`
2. WHEN an Authenticated_User requests order history, THE Data_Service SHALL query the DynamoDB_Table for all records matching the `ORDER#` sort key prefix under the user's `userId`
3. THE Data_Service SHALL return orders sorted by creation date in descending order
4. IF the DynamoDB read operation fails, THEN THE Data_Service SHALL fall back to reading orders from localStorage and log the error

### Requirement 10: Wishlist Data Persistence

**User Story:** As a customer, I want my wishlist saved to the cloud, so that I can access my saved favourites from any device.

#### Acceptance Criteria

1. WHEN an Authenticated_User adds an item to the wishlist, THE Data_Service SHALL write the WishlistItem to the DynamoDB_Table under the user's `userId` partition
2. WHEN an Authenticated_User removes an item from the wishlist, THE Data_Service SHALL delete the corresponding record from the DynamoDB_Table
3. WHEN an Authenticated_User loads the application, THE Data_Service SHALL retrieve all wishlist items from DynamoDB and load them into state
4. WHILE in Guest_User state, THE Data_Service SHALL persist wishlist data to localStorage only

### Requirement 11: AWS SDK Integration in Frontend

**User Story:** As a developer, I want a clean AWS SDK setup in the frontend, so that authentication and data operations work correctly with minimal boilerplate.

#### Acceptance Criteria

1. THE application SHALL use the `@aws-sdk/client-dynamodb` and `@aws-sdk/lib-dynamodb` packages for DynamoDB operations
2. THE application SHALL use the `aws-amplify` library (Auth module) for Cognito authentication operations
3. THE application SHALL initialise the AWS configuration in a single entry point module (replacing `firebase.ts`) that reads environment variables and exports configured clients
4. WHEN the application builds, THE bundler SHALL tree-shake unused AWS SDK modules to keep the bundle size minimal

### Requirement 12: dbService Abstraction Layer Migration

**User Story:** As a developer, I want the existing dbService interface to remain unchanged, so that component code does not need to be modified during the migration.

#### Acceptance Criteria

1. THE Data_Service SHALL export the same `dbService` interface methods: `signInAnonymously`, `signInWithEmail`, `signUpWithEmail`, `signOut`, `onAuthStateChanged`, `saveOrder`, `getOrders`, `subscribeToOrders`, `saveCart`, `getCart`
2. THE Data_Service SHALL implement each method using AWS Cognito (for auth methods) and DynamoDB (for data methods) as the backend
3. THE Data_Service SHALL maintain the same method signatures and return types as the current Firebase-based implementation
4. IF an AWS operation throws an error, THEN THE Data_Service SHALL throw an Error with a user-friendly message matching the current error message patterns

### Requirement 13: Environment Configuration and Setup Guide

**User Story:** As a beginner developer, I want clear documentation on setting up AWS resources, so that I can configure Cognito and DynamoDB without prior AWS experience.

#### Acceptance Criteria

1. THE application SHALL include an updated `.env.example` file listing all required `VITE_AWS_` environment variables with placeholder descriptions
2. THE application SHALL include a `docs/aws-setup-guide.md` file with step-by-step instructions for creating the Cognito User Pool, DynamoDB table, and IAM permissions
3. THE setup guide SHALL include instructions for configuring CORS on the Cognito User Pool for local development
4. THE setup guide SHALL include instructions for creating an IAM user or role with the minimum required permissions for DynamoDB access from the frontend

### Requirement 14: Firebase Dependency Removal

**User Story:** As a developer, I want to remove Firebase dependencies after migration, so that the project does not include unused packages.

#### Acceptance Criteria

1. WHEN the AWS migration is complete and verified, THE application SHALL remove the `firebase` package from `package.json`
2. WHEN the AWS migration is complete, THE application SHALL delete the `src/firebase.ts` module
3. WHEN the AWS migration is complete, THE application SHALL remove all Firebase-related environment variables from `.env.example`
4. THE application SHALL not import from any `firebase/*` module path after migration is complete
