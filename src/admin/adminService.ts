/**
 * Admin Service — reads all orders, products, and customers.
 * Uses the same DynamoDB table (RakhiCrateUserData).
 * Admin queries use a Scan to read across all users.
 *
 * For DynamoDB access, the admin uses the authenticated Cognito Identity Pool
 * credentials (linked to the signed-in Cognito User Pool session), NOT the
 * unauthenticated flow.
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { fetchAuthSession } from 'aws-amplify/auth';
import { awsConfig, isAwsConfigured } from '../aws-config';
import { Order } from '../types';

const TABLE = awsConfig.dynamoTableName;

// ── Build an authenticated DynamoDB client using the current Cognito session ──

async function getAdminDynamoClient(): Promise<DynamoDBDocumentClient | null> {
  if (!isAwsConfigured || !awsConfig.identityPoolId) return null;

  try {
    // Get the current Cognito ID token from the active session
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    if (!idToken) throw new Error('No active session token');

    // Build the logins map that tells the Identity Pool this is an authenticated user
    const loginKey = `cognito-idp.${awsConfig.region}.amazonaws.com/${awsConfig.userPoolId}`;

    const dynamoClient = new DynamoDBClient({
      region: awsConfig.region,
      credentials: fromCognitoIdentityPool({
        clientConfig: { region: awsConfig.region },
        identityPoolId: awsConfig.identityPoolId,
        logins: { [loginKey]: idToken },
      }),
    });

    return DynamoDBDocumentClient.from(dynamoClient, {
      marshallOptions: { removeUndefinedValues: true, convertClassInstanceToMap: true },
      unmarshallOptions: { wrapNumbers: false },
    });
  } catch (err) {
    console.error('getAdminDynamoClient error:', err);
    return null;
  }
}

// ── Local demo data (when AWS is not configured) ──────────────────────────────

function getDemoOrders(): Order[] {
  try {
    const raw = localStorage.getItem('rakhi_crate_orders');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

// ── Orders ────────────────────────────────────────────────────────────────────

export async function adminGetAllOrders(): Promise<Order[]> {
  if (!isAwsConfigured) return getDemoOrders();

  const client = await getAdminDynamoClient();
  if (!client) return getDemoOrders();

  try {
    const result = await client.send(new ScanCommand({
      TableName: TABLE,
      FilterExpression: 'begins_with(sk, :prefix)',
      ExpressionAttributeValues: { ':prefix': 'ORDER#' },
    }));

    const orders = (result.Items || []).map((item: any) => {
      const { sk: _s, ...rest } = item;
      return { ...rest, userId: item.userId } as Order;
    });

    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return orders;
  } catch (err: any) {
    console.error('adminGetAllOrders error:', err);
    // Fall back to localStorage so demo orders still show
    return getDemoOrders();
  }
}

export async function adminUpdateOrderStatus(
  userId: string,
  orderId: string,
  newStatus: Order['status']
): Promise<void> {
  const now = new Date().toISOString();

  if (!isAwsConfigured) {
    try {
      const raw = localStorage.getItem('rakhi_crate_orders');
      const orders: Order[] = raw ? JSON.parse(raw) : [];
      const updated = orders.map(o =>
        o.id === orderId ? { ...o, status: newStatus, updatedAt: now, statusUpdatedAt: now } : o
      );
      localStorage.setItem('rakhi_crate_orders', JSON.stringify(updated));
    } catch { /* ignore */ }
    return;
  }

  const client = await getAdminDynamoClient();
  if (!client) throw new Error('Could not create authenticated DynamoDB client. Ensure you are signed in.');

  await client.send(new UpdateCommand({
    TableName: TABLE,
    Key: { userId, sk: `ORDER#${orderId}` },
    UpdateExpression: 'SET #st = :status, updatedAt = :now, statusUpdatedAt = :now',
    ExpressionAttributeNames: { '#st': 'status' },
    ExpressionAttributeValues: { ':status': newStatus, ':now': now },
  }));
}

// ── Products ──────────────────────────────────────────────────────────────────

export async function adminGetAllProducts(): Promise<any[]> {
  const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || '';
  if (!apiBase) return [];
  try {
    const res = await fetch(`${apiBase}/products`);
    if (!res.ok) throw new Error('Products API error');
    const data = await res.json();
    return Array.isArray(data) ? data : (data.products || []);
  } catch (err) {
    console.error('adminGetAllProducts error:', err);
    return [];
  }
}

// ── Customers ─────────────────────────────────────────────────────────────────

export interface AdminCustomer {
  uid: string;
  email: string;
  orderCount: number;
  totalSpend: number;
  lastOrderDate: string;
}

export async function adminGetAllCustomers(): Promise<AdminCustomer[]> {
  const orders = await adminGetAllOrders();
  const map = new Map<string, AdminCustomer>();

  for (const order of orders) {
    const uid = order.userId || 'guest';
    const email = order.shipping?.senderEmail || 'unknown';
    if (!map.has(uid)) {
      map.set(uid, { uid, email, orderCount: 0, totalSpend: 0, lastOrderDate: order.createdAt });
    }
    const cust = map.get(uid)!;
    cust.orderCount += 1;
    cust.totalSpend += order.amount || 0;
    if (new Date(order.createdAt) > new Date(cust.lastOrderDate)) {
      cust.lastOrderDate = order.createdAt;
    }
  }

  return Array.from(map.values()).sort((a, b) => b.totalSpend - a.totalSpend);
}
