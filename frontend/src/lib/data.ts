/**
 * QUARANTINED — not application data.
 *
 * These mock catalogs were leftover from early UI prototyping.
 * Live Products / Branches / Orders / Stock must come from the API/database.
 * Do not import these into pages or providers.
 */
import type { User, Product, Branch, StockEntry, Order } from "./types";

/** @deprecated Do not use — not database-backed. */
export const MOCK_USERS: User[] = [];

/** @deprecated Do not use — not database-backed. */
export const MOCK_PRODUCTS: Product[] = [];

/** @deprecated Do not use — not database-backed. */
export const MOCK_BRANCHES: Branch[] = [];

/** @deprecated Do not use — not database-backed. */
export const MOCK_STOCK: StockEntry[] = [];

/** @deprecated Do not use — not database-backed. */
export const MOCK_ORDERS: Order[] = [];
