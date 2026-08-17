# Requirements Document

## Introduction

This feature integrates the existing AWS backend (API Gateway → Lambda → DynamoDB → S3) into the React + Vite + TypeScript e-commerce application. The goal is to replace all hardcoded product arrays in `src/data.ts` with live data fetched from a REST API endpoint, making the storefront fully dynamic. Adding a product to DynamoDB and uploading images to S3 should automatically display it on the website without any frontend code changes.

## Glossary

- **Product_Service**: The TypeScript service module (`src/services/productService.ts`) responsible for fetching product data from the API endpoint and transforming responses into frontend-compatible data structures.
- **API_Gateway_Endpoint**: The REST endpoint (`https://66n2y032xe.execute-api.ap-southeast-2.amazonaws.com/products`) that serves product data from DynamoDB via AWS Lambda.
- **S3_Image_URL_Builder**: The utility function that converts `imageKeys` array values into full S3 URLs using the pattern `https://rakhi-store-assets.s3.ap-southeast-2.amazonaws.com/{imageKey}`.
- **API_Product**: The TypeScript interface representing the product data structure returned by the API endpoint, including fields: productId, name, description, price, currency, category, stock, featured, isActive, slug, and imageKeys.
- **Product_Data_Hook**: A custom React hook or component-level data-fetching logic using `useState` and `useEffect` that manages loading, error, and success states for product data.
- **Loading_State**: The visual feedback presented to the user while product data is being fetched from the API endpoint.
- **Error_State**: The visual feedback presented to the user when the API request fails, including a retry mechanism.
- **Fallback_Data**: The static product data from `src/data.ts` used as a graceful fallback when the API is unreachable or returns an error after retry attempts.
- **Product_Mapper**: The transformation layer that converts API_Product objects into the existing frontend TypeScript interfaces (PreCuratedGift, StandaloneThreadItem, RakhiThread, PremiumTreat, CrateBoxStyle).

## Requirements

### Requirement 1: Product Service Layer Creation

**User Story:** As a developer, I want a dedicated service module for API communication, so that API logic is decoupled from UI components and can be maintained independently.

#### Acceptance Criteria

1. THE Product_Service SHALL expose a function `fetchProducts()` that performs a GET request to the API_Gateway_Endpoint and returns a typed array of API_Product objects.
2. THE Product_Service SHALL expose a function `getImageUrl(imageKey: string)` that constructs the full S3 URL by prepending `https://rakhi-store-assets.s3.ap-southeast-2.amazonaws.com/` to the provided imageKey.
3. THE Product_Service SHALL set a request timeout of 10 seconds for API calls.
4. IF the API request fails with a network error, THEN THE Product_Service SHALL throw a descriptive error containing the HTTP status code and message.
5. IF the API returns a non-200 HTTP response, THEN THE Product_Service SHALL throw an error with the status code and response body.
6. THE Product_Service SHALL filter returned products to include only those where `isActive` equals true.

### Requirement 2: TypeScript Interface Definition

**User Story:** As a developer, I want properly typed interfaces for API responses, so that the codebase maintains type safety across the data transformation layer.

#### Acceptance Criteria

1. THE Product_Service SHALL define an `ApiProduct` TypeScript interface with the following required fields: productId (string), name (string), description (string), price (number), currency (string), category (string), stock (number), featured (boolean), isActive (boolean), slug (string), and imageKeys (string array).
2. THE Product_Service SHALL export the ApiProduct interface for use by other modules.
3. THE Product_Mapper SHALL accept ApiProduct objects and return objects conforming to the existing frontend interfaces (PreCuratedGift, StandaloneThreadItem, RakhiThread, PremiumTreat, CrateBoxStyle) without modification to those existing interfaces.

### Requirement 3: Image URL Construction

**User Story:** As a user, I want to see product images stored in S3, so that the storefront displays high-quality product photography managed via the cloud.

#### Acceptance Criteria

1. WHEN an API_Product contains an imageKeys array, THE S3_Image_URL_Builder SHALL convert each key into a URL following the pattern `https://rakhi-store-assets.s3.ap-southeast-2.amazonaws.com/{imageKey}`.
2. WHEN an API_Product contains an empty imageKeys array, THE S3_Image_URL_Builder SHALL return a placeholder image URL.
3. THE S3_Image_URL_Builder SHALL use the first item in the imageKeys array as the primary display image for product cards and listings.

### Requirement 4: React Data Fetching with State Management

**User Story:** As a user, I want products to load from the live database when I visit the store, so that I always see the current product catalog.

#### Acceptance Criteria

1. WHEN the application mounts, THE Product_Data_Hook SHALL initiate a fetch request to the API_Gateway_Endpoint using React useEffect.
2. WHILE the API request is pending, THE Product_Data_Hook SHALL expose a loading state set to true.
3. WHEN the API request succeeds, THE Product_Data_Hook SHALL store the transformed product data in React useState and set the loading state to false.
4. IF the API request fails, THEN THE Product_Data_Hook SHALL set an error state with the failure message and set the loading state to false.
5. THE Product_Data_Hook SHALL execute the fetch request only once on component mount by providing an empty dependency array to useEffect.

### Requirement 5: Loading State UI

**User Story:** As a user, I want visual feedback while products are loading, so that I know the page is working and not broken.

#### Acceptance Criteria

1. WHILE the loading state is true, THE Loading_State SHALL display skeleton placeholder elements matching the layout dimensions of product cards.
2. WHILE the loading state is true, THE Loading_State SHALL include a pulsing animation on skeleton elements to indicate ongoing activity.
3. WHILE the loading state is true, THE Loading_State SHALL not display stale product data from a previous session.

### Requirement 6: Error Handling and Retry

**User Story:** As a user, I want to see a clear error message and have the option to retry when product loading fails, so that temporary network issues do not permanently prevent me from browsing products.

#### Acceptance Criteria

1. IF the API request fails, THEN THE Error_State SHALL display a user-friendly error message indicating products could not be loaded.
2. IF the API request fails, THEN THE Error_State SHALL display a "Retry" button that re-triggers the fetch request when clicked.
3. IF the API request fails after a retry attempt, THEN THE Error_State SHALL fall back to displaying the Fallback_Data from the static data file.
4. THE Error_State SHALL not display raw error codes or stack traces to the user.

### Requirement 7: Graceful Fallback to Static Data

**User Story:** As a user, I want the store to still display products even when the API is unavailable, so that I can browse the catalog regardless of backend status.

#### Acceptance Criteria

1. IF the API request fails and all retry attempts are exhausted, THEN THE Product_Data_Hook SHALL populate product state from the existing static arrays (PRE_CURATED_GIFTS, STANDALONE_THREADS, RAKHI_THREADS, PREMIUM_TREATS, CRATE_BOX_STYLES) defined in `src/data.ts`.
2. WHILE Fallback_Data is being used, THE application SHALL display a dismissible banner informing the user that cached data is being shown.
3. THE application SHALL preserve all existing cart, wishlist, checkout, and search functionality when operating with Fallback_Data.

### Requirement 8: Product Data Mapping to Existing UI Components

**User Story:** As a developer, I want API data mapped to existing TypeScript interfaces, so that the UI components continue to render correctly without modification.

#### Acceptance Criteria

1. THE Product_Mapper SHALL transform API_Product objects with category "Gift Boxes" into PreCuratedGift interface objects.
2. THE Product_Mapper SHALL transform API_Product objects with category "Threads" into StandaloneThreadItem or RakhiThread interface objects based on additional product attributes.
3. THE Product_Mapper SHALL transform API_Product objects with category "Sweets" into PremiumTreat interface objects.
4. THE Product_Mapper SHALL transform API_Product objects with category "Crate Boxes" into CrateBoxStyle interface objects.
5. THE Product_Mapper SHALL assign the first imageKeys URL as the image field in all mapped interfaces.
6. IF an API_Product contains fields not present in the target interface, THEN THE Product_Mapper SHALL discard those fields without causing runtime errors.

### Requirement 9: Dynamic Storefront Rendering

**User Story:** As a store owner, I want new products added to DynamoDB to appear automatically on the website, so that I can manage inventory without frontend deployments.

#### Acceptance Criteria

1. WHEN a new product is added to DynamoDB with isActive set to true and images uploaded to S3, THE application SHALL display the new product on the next page load without requiring frontend code changes.
2. WHEN a product is marked as isActive false in DynamoDB, THE application SHALL not display that product on the next page load.
3. WHEN a product's price or description is updated in DynamoDB, THE application SHALL reflect the updated values on the next page load.
4. THE application SHALL categorize and display products in the correct UI section based on the category field from the API response.

### Requirement 10: Search Integration with Live Data

**User Story:** As a user, I want the search functionality to work with live product data, so that I can find dynamically loaded products by name, description, or category.

#### Acceptance Criteria

1. WHEN products are loaded from the API, THE SearchBar component SHALL search through the live product data instead of static imported arrays.
2. THE SearchBar component SHALL filter results by product name, description, category label, and badge text using the same filtering logic currently applied to static data.
3. THE SearchBar component SHALL display accurate item counts per category filter (All, Rakhis, Sweets, Hampers) based on live data.

### Requirement 11: Crate Builder Integration with Live Data

**User Story:** As a user, I want the Customize Crate Builder to use live product data, so that newly added threads, treats, and box styles are available for crate customization.

#### Acceptance Criteria

1. WHEN products are loaded from the API, THE CustomizeCrateBuilder component SHALL use live RakhiThread, PremiumTreat, and CrateBoxStyle data for crate customization options.
2. THE CustomizeCrateBuilder component SHALL continue to support relationship-based filtering (brother, kids, bhaiya-bhabhi) on live Rakhi thread data.
3. THE CustomizeCrateBuilder component SHALL correctly calculate crate totals using live prices from the API.

### Requirement 12: Preservation of Static Assets and Non-Product Content

**User Story:** As a developer, I want static hero images, banners, icons, and theme configuration to remain unchanged, so that the visual identity of the site is preserved during the API integration.

#### Acceptance Criteria

1. THE application SHALL continue to source HERO_IMAGES, RELATION_IMAGES, PANTRY_IMAGES, and CARD_TEMPLATES from the static `src/data.ts` file.
2. THE application SHALL not modify existing CSS, Tailwind theme configuration, animations, or responsive breakpoints.
3. THE application SHALL preserve all existing functionality including cart management, wishlist, Cognito authentication, checkout flow, order tracking, FAQ section, and currency conversion.

### Requirement 13: Production Readiness and Code Quality

**User Story:** As a developer, I want the integration to follow best practices, so that the codebase remains maintainable, scalable, and performant.

#### Acceptance Criteria

1. THE Product_Service SHALL store the API base URL and S3 bucket URL in environment variables (VITE_API_BASE_URL and VITE_S3_BUCKET_URL) rather than hardcoding them.
2. THE Product_Service SHALL implement request error logging to the browser console in development mode.
3. THE application SHALL not expose AWS access keys, secret keys, or sensitive credentials in client-side code shipped to the browser.
4. THE Product_Service module SHALL be located at `src/services/productService.ts` following a modular directory structure.
5. THE Product_Data_Hook SHALL prevent memory leaks by aborting pending fetch requests when the component unmounts using AbortController.
