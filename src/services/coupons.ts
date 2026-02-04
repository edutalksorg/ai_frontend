import { apiService } from './api';
import type {
  Coupon,
  CreateCouponRequest,
  UpdateCouponRequest,
  ValidateCouponRequest,
  ValidateCouponResponse,
  ApplyCouponRequest,
  CouponListParams,
} from '../types';

/**
 * Coupon Service
 * Handles all coupon-related API operations
 */
export const couponsService = {
  /**
   * Create a new coupon
   */
  create: async (data: CreateCouponRequest): Promise<Coupon> =>
    apiService.post<Coupon>('/coupons', data),

  /**
   * List all coupons with optional filters
   */
  list: async (params?: CouponListParams): Promise<Coupon[]> =>
    apiService.get<Coupon[]>('/coupons', { params }),

  /**
   * Get coupon details by code
   */
  getByCode: async (code: string): Promise<Coupon> =>
    apiService.get<Coupon>(`/coupons/${code}`),

  /**
   * Validate a coupon before applying
   */
  validate: async (data: ValidateCouponRequest): Promise<ValidateCouponResponse> =>
    apiService.post<ValidateCouponResponse>('/coupons/validate', data),

  /**
   * Get users who have used a specific coupon
   */
  getUsageUsers: async (id: string): Promise<any[]> =>
    apiService.get<any[]>(`/admin/coupons/${id}/users`),

  /**
   * Apply a coupon to an order
   */
  apply: async (data: ApplyCouponRequest): Promise<void> =>
    apiService.post<void>('/coupons/apply', data),

  /**
   * Update an existing coupon
   */
  update: async (id: string, data: UpdateCouponRequest): Promise<Coupon> =>
    apiService.put<Coupon>(`/coupons/${id}`, data),

  /**
   * Delete a coupon
   */
  delete: async (id: string): Promise<void> =>
    apiService.delete<void>(`/coupons/${id}`),

  /**
   * Get active coupons only
   */
  getActiveCoupons: async (params?: CouponListParams): Promise<Coupon[]> =>
    apiService.get<Coupon[]>('/coupons', { params: { ...params, status: 1 } }),
};

export default couponsService;
