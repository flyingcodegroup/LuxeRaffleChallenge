export const API_BASE_URL = 'http://localhost:3000';

// Shared by getOrders (read tag) and checkout (revalidate). Kept here
// because 'use server' files can only export async functions.
export const ORDERS_CACHE_TAG = 'orders';
