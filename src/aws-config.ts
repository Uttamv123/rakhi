import { Amplify } from 'aws-amplify';
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

// Lazy-initialized DynamoDB Document Client
let docClient: DynamoDBDocumentClient | null = null;

export function getDynamoClient(): DynamoDBDocumentClient | null {
  if (!isAwsConfigured || !awsConfig.identityPoolId) {
    return null;
  }

  if (docClient) {
    return docClient;
  }

  try {
    const dynamoClient = new DynamoDBClient({
      region: awsConfig.region,
      credentials: fromCognitoIdentityPool({
        clientConfig: { region: awsConfig.region },
        identityPoolId: awsConfig.identityPoolId,
      }),
    });

    docClient = DynamoDBDocumentClient.from(dynamoClient, {
      marshallOptions: {
        removeUndefinedValues: true,
        convertClassInstanceToMap: true,
      },
      unmarshallOptions: {
        wrapNumbers: false,
      },
    });

    return docClient;
  } catch (error) {
    console.error('Failed to create DynamoDB client:', error);
    return null;
  }
}
