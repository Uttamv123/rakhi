import type {
  PreCuratedGift,
  StandaloneThreadItem,
  RakhiThread,
  PremiumTreat,
  CrateBoxStyle,
} from '../types';
import { getImageUrl, getPrimaryImage, type ApiProduct } from './productService';

/**
 * Result of mapping all API products into their respective frontend interfaces.
 */
export interface MappedProducts {
  preCuratedGifts: PreCuratedGift[];
  standaloneThreads: StandaloneThreadItem[];
  rakhiThreads: RakhiThread[];
  premiumTreats: PremiumTreat[];
  crateBoxStyles: CrateBoxStyle[];
}

/**
 * Determines the relation type for a Gift Box product based on slug/name heuristics.
 */
function deriveRelation(product: ApiProduct): 'brother' | 'kids' | 'couple' {
  const text = `${product.name} ${product.slug} ${product.description}`.toLowerCase();
  if (text.includes('kid')) return 'kids';
  if (text.includes('couple') || text.includes('bhaiya') || text.includes('bhabhi') || text.includes('lumba')) return 'couple';
  return 'brother';
}

/**
 * Derives rakhiName from the product name/description.
 * Attempts to extract a meaningful rakhi name from the gift box product.
 */
function deriveRakhiName(product: ApiProduct): string {
  // Try to extract rakhi-related portion from the name
  const name = product.name;
  const parts = name.split('&');
  if (parts.length >= 1) {
    // First part typically contains the rakhi reference
    const rakhiPart = parts[0].trim();
    if (rakhiPart.toLowerCase().includes('rakhi') || rakhiPart.toLowerCase().includes('thread')) {
      return rakhiPart;
    }
  }
  // Fallback: use the full product name as the rakhi name
  return name;
}

/**
 * Derives sweetsName from the product name/description.
 * Attempts to extract a meaningful sweets/treat name from the gift box product.
 */
function deriveSweetsName(product: ApiProduct): string {
  const name = product.name;
  const parts = name.split('&');
  if (parts.length >= 2) {
    // Second part typically contains the sweets reference
    return parts[1].trim();
  }
  // Fallback: extract from description or use a generic name
  const desc = product.description.toLowerCase();
  if (desc.includes('kaju katli') || desc.includes('kaju')) return 'Kaju Katli';
  if (desc.includes('dry fruit') || desc.includes('almond') || desc.includes('cashew') || desc.includes('pistachio')) return 'Premium Dry Fruits';
  if (desc.includes('chocolate')) return 'Assorted Chocolates';
  if (desc.includes('sweet') || desc.includes('mithai')) return 'Traditional Sweets';
  return 'Premium Treats';
}

/**
 * Maps an ApiProduct with category "Gift Boxes" to a PreCuratedGift.
 */
export function mapToPreCuratedGift(product: ApiProduct): PreCuratedGift {
  return {
    id: product.productId,
    name: product.name,
    description: product.description,
    price: product.price,
    image: getPrimaryImage(product.imageKeys),
    images: product.imageKeys.length > 0 ? product.imageKeys.map(getImageUrl) : undefined,
    rakhiName: deriveRakhiName(product),
    sweetsName: deriveSweetsName(product),
    relation: deriveRelation(product),
    badge: product.slug || undefined,
  };
}

/**
 * Determines whether a thread is 'normal' or 'premium' based on price.
 * Premium threshold: price >= 14
 */
function deriveThreadType(price: number): 'normal' | 'premium' {
  return price >= 14 ? 'premium' : 'normal';
}

/**
 * Extracts madeOf information from a product description.
 * Provides sensible defaults when parsing isn't possible.
 */
function deriveMadeOf(product: ApiProduct): string {
  // Try to extract material information from description
  const desc = product.description;
  const madeOfPatterns = [
    /made (?:of|from|with) ([^.]+)/i,
    /crafted (?:from|with) ([^.]+)/i,
    /featuring ([^.]+)/i,
  ];

  for (const pattern of madeOfPatterns) {
    const match = desc.match(pattern);
    if (match) return match[1].trim();
  }

  // Provide a sensible default based on available info
  return product.description.split('.')[0] || 'Premium handcrafted materials';
}

/**
 * Derives whatsIncluded from description. Provides sensible defaults.
 */
function deriveWhatsIncluded(product: ApiProduct): string[] {
  // Default items that all threads typically include
  return [
    `1x ${product.name}`,
    '1x Premium Kumkum Roli & Rice Tilak Duo Pack',
  ];
}

/**
 * Maps an ApiProduct with category "Threads" to a StandaloneThreadItem.
 */
export function mapToStandaloneThread(product: ApiProduct): StandaloneThreadItem {
  return {
    id: product.productId,
    type: deriveThreadType(product.price),
    name: product.name,
    description: product.description,
    madeOf: deriveMadeOf(product),
    whatsIncluded: deriveWhatsIncluded(product),
    price: product.price,
    image: getPrimaryImage(product.imageKeys),
    badge: product.slug || undefined,
  };
}

/**
 * Derives relationTags for a RakhiThread based on keywords in name/description.
 */
function deriveRelationTags(product: ApiProduct): string[] {
  const text = `${product.name} ${product.description}`.toLowerCase();

  if (text.includes('kid') || text.includes('child') || text.includes('little') || text.includes('cartoon') || text.includes('playful')) {
    return ['kids'];
  }
  if (text.includes('bhaiya') || text.includes('bhabhi') || text.includes('couple') || text.includes('lumba')) {
    return ['bhaiya-bhabhi'];
  }
  return ['brother'];
}

/**
 * Maps an ApiProduct with category "Threads" to a RakhiThread.
 */
export function mapToRakhiThread(product: ApiProduct): RakhiThread {
  return {
    id: product.productId,
    name: product.name,
    description: product.description,
    price: product.price,
    image: getPrimaryImage(product.imageKeys),
    relationTags: deriveRelationTags(product),
  };
}

/**
 * Determines the PremiumTreat sub-category from name/description heuristics.
 */
function deriveTreatCategory(product: ApiProduct): 'sweets' | 'dry-fruits' | 'chocolates' {
  const text = `${product.name} ${product.description}`.toLowerCase();

  if (text.includes('chocolate') || text.includes('cocoa')) return 'chocolates';
  if (
    text.includes('dry') ||
    text.includes('nut') ||
    text.includes('almond') ||
    text.includes('pistachio') ||
    text.includes('cashew') ||
    text.includes('walnut')
  ) {
    return 'dry-fruits';
  }
  return 'sweets';
}

/**
 * Maps an ApiProduct with category "Sweets" to a PremiumTreat.
 */
export function mapToPremiumTreat(product: ApiProduct): PremiumTreat {
  return {
    id: product.productId,
    name: product.name,
    category: deriveTreatCategory(product),
    description: product.description,
    price: product.price,
    image: getPrimaryImage(product.imageKeys),
  };
}

/**
 * Maps an ApiProduct with category "Crate Boxes" to a CrateBoxStyle.
 */
export function mapToCrateBoxStyle(product: ApiProduct): CrateBoxStyle {
  return {
    id: product.productId,
    name: product.name,
    description: product.description,
    price: product.price,
    image: getPrimaryImage(product.imageKeys),
  };
}

/**
 * Orchestrates mapping of all API products into their respective frontend interfaces
 * based on the product category field.
 *
 * - "Gift Boxes" → PreCuratedGift[]
 * - "Threads" → StandaloneThreadItem[] AND RakhiThread[] (same products, different transformations)
 * - "Sweets" → PremiumTreat[]
 * - "Crate Boxes" → CrateBoxStyle[]
 */
export function mapProducts(products: ApiProduct[]): MappedProducts {
  const result: MappedProducts = {
    preCuratedGifts: [],
    standaloneThreads: [],
    rakhiThreads: [],
    premiumTreats: [],
    crateBoxStyles: [],
  };

  for (const product of products) {
    switch (product.category) {
      case 'Gift Boxes':
        result.preCuratedGifts.push(mapToPreCuratedGift(product));
        break;
      case 'Threads':
        // Map to BOTH standalone threads and rakhi threads
        result.standaloneThreads.push(mapToStandaloneThread(product));
        result.rakhiThreads.push(mapToRakhiThread(product));
        break;
      case 'Sweets':
        result.premiumTreats.push(mapToPremiumTreat(product));
        break;
      case 'Crate Boxes':
        result.crateBoxStyles.push(mapToCrateBoxStyle(product));
        break;
      // Unknown categories are silently discarded
    }
  }

  return result;
}
