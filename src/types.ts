/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CrateBoxStyle {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export interface RakhiThread {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  relationTags: string[]; // e.g., 'brother', 'kids', 'bhaiya-bhabhi'
}

export interface PremiumTreat {
  id: string;
  name: string;
  category: 'sweets' | 'dry-fruits' | 'chocolates';
  description: string;
  price: number;
  image: string;
  weightGrams?: number;
}

export interface MessageCardTemplate {
  id: string;
  name: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  fontClass: string;
  bgPattern?: string;
}

export interface PersonalizedCard {
  templateId: string;
  toName: string;
  fromName: string;
  message: string;
}

export interface CustomCrate {
  boxStyle: CrateBoxStyle;
  rakhi: RakhiThread;
  treats: PremiumTreat[];
  messageCard: PersonalizedCard;
}

export interface PreCuratedGift {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  rakhiName: string;
  sweetsName: string;
  relation: 'brother' | 'kids' | 'couple';
  badge?: string;
}

export interface StandaloneThreadItem {
  id: string;
  type: 'normal' | 'premium';
  name: string;
  description: string;
  madeOf: string;
  whatsIncluded: string[];
  price: number;
  image: string;
  badge?: string;
}

export interface CartItem {
  id: string; // Unique ID for this specific cart instance
  type: 'pre-curated' | 'custom-crate' | 'standalone-thread';
  title: string;
  price: number;
  image: string;
  description: string;
  details: {
    crateBoxName?: string;
    rakhiName?: string;
    treatsNames?: string[];
    card?: PersonalizedCard;
  };
  quantity: number;
}

export interface ShippingDetails {
  senderName: string;
  senderEmail: string;
  recipientName: string;
  recipientPhone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postcode: string;
  country: string;
  deliveryDate: string; // Target delivery date
}

export interface Order {
  id: string;
  userId?: string;
  createdAt: string;
  items: CartItem[];
  shipping: ShippingDetails;
  paymentMethod: 'stripe' | 'paypal';
  amount: number;
  status: 'ordered' | 'assembled' | 'dispatched' | 'out-for-delivery' | 'delivered';
  timeline: {
    status: 'ordered' | 'assembled' | 'dispatched' | 'out-for-delivery' | 'delivered';
    timestamp: string;
    title: string;
    description: string;
    completed: boolean;
  }[];
}

export interface SimulatedEmail {
  id: string;
  orderId: string;
  subject: string;
  sentAt: string;
  bodyHtml: string;
  read: boolean;
}
