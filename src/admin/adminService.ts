/**
 * Admin Service — reads all orders, products, and customers.
 * Uses the same DynamoDB table (RakhiCrateUserData) and same AWS credentials.
 * Admin queries use a Scan to read across all users.
 * In production, backend Lambda should be used for admin scans.
 */

import { ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { awsConfig, getDynamoClient, isAwsConfigured } from '../aws-config';
import { Order } from '../types';

const TABLE = awsConfig.dynamoTableName;

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

  const client = getDynamoClient();
  if (!client) return getDemoOrders();

  try {
    const result = await client.send(new ScanCommand({
      TableName: TABLE,
      FilterExpression: 'begins_with(sk, :prefix)',
      ExpressionAttributeValues: { ':prefix': 'ORDER#' },
    }));

    const orders = (result.Items || []).map((item: any) => {
      const { userId: _u, sk: _s, ...rest } = item;
      return { ...rest, userId: item.userId } as Order;
    });

    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return orders;
  } catch (err) {
    console.error('adminGetAllOrders error:', err);
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
    // Update localStorage
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

  const client = getDynamoClient();
  if (!client) throw new Error('DynamoDB client unavailable');

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
  if (!apiBase) {
    // Return demo product data from localStorage or empty
    return [];
  }
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

  // Derive customers from orders
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
