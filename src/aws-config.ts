import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';

const env = (import.meta as any).env || {};

export const awsConfig = {
  region: env.VITE_AWS_REGION || '',
  userPoolId: env.VITE_AWS_USER_POOL_ID || '',
  userPoolClientId: env.VITE_AWS_USER_POOL_CLIENT_ID || '',
  identityPoolId: env.VITE_AWS_IDENTITY_POOL_ID || '',
  dynamoTableName: env.VITE_AWS_DYNAMO_TABLE_NAME || 'RakhiCrateUserData',
};

export const isAwsConfigured: boolean = !!(
  awsConfig.region &&
  awsConfig.userPoolId &&
  awsConfig.userPoolClientId
);

console.log('[AWS Config] Region:', awsConfig.region, '| isConfigured:', isAwsConfigured);

// Configure Amplify Auth if AWS env vars are present
if (isAwsConfigured) {
  try {
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: awsConfig.userPoolId,
          userPoolClientId: awsConfig.userPoolClientId,
          identityPoolId: awsConfig.identityPoolId || undefined,
          loginWith: {
            email: true,
          },
          signUpVerificationMethod: 'code',
          userAttributes: {
            email: { required: true },
          },
          passwordFormat: {
            minLength: 8,
            requireLowercase: true,
            requireUppercase: true,
            requireNumbers: true,
          },
        },
      },
    });
    console.log('AWS initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize AWS:', error);
  }
}

// The Cognito User Pool provider key used in the Identity Pool logins map
const cognitoProviderKey =
  `cognito-idp.${awsConfig.region}.amazonaws.com/${awsConfig.userPoolId}`;

/**
 * Returns a DynamoDB Document Client authenticated with the current Cognito
 * session. A new client is created on every call so credentials are never
 * stale across login/logout transitions.
 *
 * Returns null when:
 *  - AWS is not configured
 *  - The Identity Pool ID is missing
 *  - There is no authenticated session (guest users)
 */
export async function getDynamoClient(): Promise<DynamoDBDocumentClient | null> {
  if (!isAwsConfigured || !awsConfig.identityPoolId) {
    return null;
  }

  // Fetch the current Amplify auth session to get the ID token
  let idToken: string | undefined;
  try {
    const session = await fetchAuthSession();
    idToken = session.tokens?.idToken?.toString();
  } catch {
    // No authenticated session — do not attempt authenticated Identity Pool access
    return null;
  }

  if (!idToken) {
    // User is not signed in — returning null prevents unauthenticated DynamoDB calls
    return null;
  }

  try {
    const dynamoClient = new DynamoDBClient({
      region: awsConfig.region,
      credentials: fromCognitoIdentityPool({
        clientConfig: { region: awsConfig.region },
        identityPoolId: awsConfig.identityPoolId,
        // Pass the Cognito ID token so the Identity Pool treats this as authenticated
        logins: {
          [cognitoProviderKey]: idToken,
        },
      }),
    });

    return DynamoDBDocumentClient.from(dynamoClient, {
      marshallOptions: {
        removeUndefinedValues: true,
        convertClassInstanceToMap: true,
      },
      unmarshallOptions: {
        wrapNumbers: false,
      },
    });
  } catch (error) {
    console.error('Failed to create DynamoDB client:', error);
    return null;
  }
}
