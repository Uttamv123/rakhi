# Implementation Plan: AWS API Product Integration

## Overview

Replace hardcoded product data with live data fetched from the AWS backend (API Gateway → Lambda → DynamoDB → S3). Implementation follows a bottom-up approach: environment config → service layer → mapper → hook → component wiring. Each step builds on the previous one, ending with full integration across SearchBar, CustomizeCrateBuilder, and App.tsx.

## Tasks

- [x] 1. Environment configuration and project setup
  - [x] 1.1 Add environment variables and install test dependencies
    - Add `VITE_API_BASE_URL` and `VITE_S3_BUCKET_URL` to `.env` file
    - Add `.env.example` with placeholder values for documentation
    - Ensure `vitest` and `fast-check` are available as dev dependencies in `package.json`
    - Create `src/services/` and `src/hooks/` directories
    - _Requirements: 13.1_

- [x] 2. Implement Product Service layer
  - [x] 2.1 Create ApiProduct interface and productService module
    - Create `src/services/productService.ts`
    - Define and export `ApiProduct` interface with fields: productId, name, description, price, currency, category, stock, featured, isActive, slug, imageKeys
    - Implement `getImageUrl(imageKey: string): string` that constructs S3 URL from `VITE_S3_BUCKET_URL` env var
    - Implement `getPrimaryImage(imageKeys: string[]): string` returning placeholder for empty arrays
    - Implement `fetchProducts(): Promise<ApiProduct[]>` with 10-second AbortController timeout
    - Filter returned products to only include `isActive === true`
    - Throw descriptive errors containing HTTP status code for non-200 responses and network failures
    - Log errors to console in development mode only
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 3.1, 3.2, 3.3, 13.1, 13.2, 13.4_

  - [ ]* 2.2 Write property test: Image URL Construction (Property 1)
    - **Property 1: Image URL Construction**
    - For any non-empty imageKey string, `getImageUrl(imageKey)` returns `VITE_S3_BUCKET_URL + "/" + imageKey`
    - For any non-empty imageKeys array, `getPrimaryImage(imageKeys)` returns `getImageUrl(imageKeys[0])`
    - For empty imageKeys array, `getPrimaryImage` returns placeholder image
    - Create test file at `src/__tests__/productService.property.test.ts`
    - Use fast-check with minimum 100 iterations
    - **Validates: Requirements 1.2, 3.1, 3.3, 8.5**

  - [ ]* 2.3 Write property test: Active Products Filter Invariant (Property 2)
    - **Property 2: Active Products Filter Invariant**
    - For any array of ApiProduct objects with mixed isActive values, filtered result contains only products with `isActive === true`
    - No product with `isActive === false` is present after filtering
    - Use fast-check arbitrary to generate random ApiProduct arrays
    - **Validates: Requirements 1.6, 9.2**

  - [ ]* 2.4 Write property test: Error Contains Status Code (Property 3)
    - **Property 3: Error Contains Status Code**
    - For any HTTP status code in range 400-599, the error thrown by fetchProducts contains that status code as substring
    - Mock fetch to return various error status codes
    - **Validates: Requirements 1.4, 1.5**

- [x] 3. Implement Product Mapper
  - [x] 3.1 Create productMapper module with category-based transformation
    - Create `src/services/productMapper.ts`
    - Implement `mapToPreCuratedGift(product: ApiProduct): PreCuratedGift` for "Gift Boxes" category
    - Implement `mapToStandaloneThread(product: ApiProduct): StandaloneThreadItem` for "Threads" category (normal/premium)
    - Implement `mapToRakhiThread(product: ApiProduct): RakhiThread` for "Threads" category (with relationTags)
    - Implement `mapToPremiumTreat(product: ApiProduct): PremiumTreat` for "Sweets" category
    - Implement `mapToCrateBoxStyle(product: ApiProduct): CrateBoxStyle` for "Crate Boxes" category
    - Implement main `mapProducts(products: ApiProduct[]): MappedProducts` orchestrating function
    - Use `getPrimaryImage` for image field in all mapped interfaces
    - Discard extra API fields not present in target interfaces
    - Import types from `src/types.ts` — do NOT modify existing interfaces
    - _Requirements: 2.3, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [ ]* 3.2 Write property test: Category-Based Mapping (Property 4)
    - **Property 4: Category-Based Mapping Produces Valid Interface**
    - For any valid ApiProduct with category "Gift Boxes", output has all required PreCuratedGift fields
    - For any valid ApiProduct with category "Threads", output has all required StandaloneThreadItem or RakhiThread fields
    - For any valid ApiProduct with category "Sweets", output has all required PremiumTreat fields
    - For any valid ApiProduct with category "Crate Boxes", output has all required CrateBoxStyle fields
    - No additional source fields appear in mapped output
    - Create test file at `src/__tests__/productMapper.property.test.ts`
    - **Validates: Requirements 2.3, 8.1, 8.2, 8.3, 8.4, 8.6**

- [x] 4. Checkpoint - Service and mapper tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement useProducts React hook
  - [x] 5.1 Create useProducts hook with fetch lifecycle management
    - Create `src/hooks/useProducts.ts`
    - Use `useState` to manage: preCuratedGifts, standaloneThreads, rakhiThreads, premiumTreats, crateBoxStyles, isLoading, error, isFallback
    - Use `useEffect` with empty dependency array to fetch on mount only
    - Implement AbortController for cleanup on unmount to prevent memory leaks
    - On success: pass API data through productMapper, set mapped results to state
    - On first failure: retry once immediately
    - On second failure: fall back to static data from `src/data.ts` and set `isFallback = true`
    - Expose `retry()` function to allow manual re-fetch
    - Return typed `UseProductsReturn` object
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 6.2, 6.3, 7.1, 13.5_

  - [ ]* 5.2 Write unit tests for useProducts hook
    - Test loading → success state transition
    - Test loading → error → fallback state transition
    - Test AbortController cleanup on unmount
    - Test retry function triggers re-fetch
    - Test empty dependency array (fetch only on mount)
    - Mock productService.fetchProducts and productMapper
    - Create test file at `src/__tests__/useProducts.test.ts`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 13.5_

- [x] 6. Integrate live data into App.tsx
  - [x] 6.1 Replace static product imports with useProducts hook in App.tsx
    - Import and call `useProducts()` hook in App.tsx
    - Remove static product array imports (PRE_CURATED_GIFTS, STANDALONE_THREADS, RAKHI_THREADS, PREMIUM_TREATS, CRATE_BOX_STYLES) from App.tsx
    - Keep static asset imports (HERO_IMAGES, RELATION_IMAGES, PANTRY_IMAGES, CARD_TEMPLATES) unchanged
    - Pass mapped product data to existing rendering sections
    - Add loading state UI: skeleton placeholder elements with pulsing animation matching product card dimensions
    - Add error state UI: user-friendly message with "Try Again" button (no raw error codes)
    - Add fallback banner: dismissible amber banner "Showing cached catalog. Live data unavailable."
    - Ensure all existing functionality (cart, wishlist, checkout, currency conversion, auth) remains intact
    - _Requirements: 4.1, 5.1, 5.2, 5.3, 6.1, 6.2, 6.4, 7.2, 7.3, 9.1, 9.3, 9.4, 12.1, 12.2, 12.3_

- [x] 7. Integrate live data into SearchBar component
  - [x] 7.1 Update SearchBar to accept products as props
    - Modify `src/components/SearchBar.tsx` to accept product data arrays as props instead of importing from `data.ts`
    - Remove static product imports from SearchBar
    - Maintain existing search/filter logic (name, description, category, badge matching)
    - Update category counts (All, Rakhis, Sweets, Hampers) to calculate from live data
    - Pass live product data from App.tsx to SearchBar as props
    - _Requirements: 10.1, 10.2, 10.3_

  - [ ]* 7.2 Write property test: Search Filter Correctness (Property 5)
    - **Property 5: Search Filter Correctness**
    - For any query string and array of search items, every result has query as substring of title, description, categoryLabel, or badge
    - Count per category in result equals actual count of matching items for that category
    - Create test file at `src/__tests__/searchFilter.property.test.ts`
    - **Validates: Requirements 10.2, 10.3**

- [x] 8. Integrate live data into CustomizeCrateBuilder component
  - [x] 8.1 Update CustomizeCrateBuilder to accept products as props
    - Modify `src/components/CustomizeCrateBuilder.tsx` to accept RakhiThread[], PremiumTreat[], and CrateBoxStyle[] as props
    - Remove static product imports from CustomizeCrateBuilder
    - Preserve relationship-based filtering (brother, kids, bhaiya-bhabhi) on live Rakhi thread data
    - Ensure crate total calculation uses live prices from props
    - Pass live product data from App.tsx to CustomizeCrateBuilder as props
    - _Requirements: 11.1, 11.2, 11.3_

  - [ ]* 8.2 Write property test: Relationship-Based Thread Filtering (Property 6)
    - **Property 6: Relationship-Based Thread Filtering**
    - For any RakhiThread array and relation tag, filtered results contain only threads with that tag in relationTags
    - No thread containing the tag is excluded from results
    - Create test file at `src/__tests__/crateBuilder.property.test.ts`
    - **Validates: Requirements 11.2**

  - [ ]* 8.3 Write property test: Crate Total Calculation (Property 7)
    - **Property 7: Crate Total Calculation**
    - For any valid selection of one CrateBoxStyle, one RakhiThread, and zero or more PremiumTreat items, total equals boxStyle.price + rakhi.price + sum(treats prices)
    - Append to `src/__tests__/crateBuilder.property.test.ts`
    - **Validates: Requirements 11.3**

- [x] 9. Final checkpoint - Full integration verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Static assets (HERO_IMAGES, RELATION_IMAGES, PANTRY_IMAGES, CARD_TEMPLATES) remain in src/data.ts and are NOT touched
- Existing interfaces in src/types.ts are NOT modified — the mapper outputs exact matches

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "3.1"] },
    { "id": 3, "tasks": ["3.2", "5.1"] },
    { "id": 4, "tasks": ["5.2", "6.1"] },
    { "id": 5, "tasks": ["7.1", "8.1"] },
    { "id": 6, "tasks": ["7.2", "8.2", "8.3"] }
  ]
}
```
