/** Shape returned by GET /products endpoint */
export interface ApiProduct {
  productId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  stock: number;
  featured: boolean;
  isActive: boolean;
  slug: string;
  imageKeys: string[];
}

const PLACEHOLDER_IMAGE = '/hero-rakhi.png';

/**
 * Constructs a full S3 URL from an image key.
 * @param imageKey - The S3 object key (e.g. "products/RK001/image1.webp")
 * @returns Full S3 URL for the image
 */
export function getImageUrl(imageKey: string): string {
  const baseUrl = import.meta.env.VITE_S3_BUCKET_URL;
  return `${baseUrl}/${imageKey}`;
}

/**
 * Returns the primary image URL from an imageKeys array.
 * Falls back to a placeholder image when the array is empty.
 * @param imageKeys - Array of S3 object keys
 * @returns URL for the primary display image
 */
export function getPrimaryImage(imageKeys: string[]): string {
  if (!imageKeys || imageKeys.length === 0) return PLACEHOLDER_IMAGE;
  return getImageUrl(imageKeys[0]);
}

/**
 * Fetches products from the API Gateway endpoint.
 * - Uses a 10-second AbortController timeout
 * - Filters results to only include active products (isActive === true)
 * - Throws descriptive errors with HTTP status codes for non-200 responses
 * - Logs errors to console in development mode only
 * @returns Promise resolving to an array of active ApiProduct objects
 */
export async function fetchProducts(): Promise<ApiProduct[]> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const url = `${baseUrl}/products`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch products: HTTP ${response.status} ${response.statusText}`
      );
    }

    const data: ApiProduct[] = await response.json();
    return data.filter((product) => product.isActive === true);
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      const timeoutError = new Error(
        'Failed to fetch products: Request timed out after 10 seconds'
      );
      if (import.meta.env.DEV) {
        console.error('[productService]', timeoutError.message);
      }
      throw timeoutError;
    }

    if (import.meta.env.DEV) {
      console.error('[productService]', (error as Error).message);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
