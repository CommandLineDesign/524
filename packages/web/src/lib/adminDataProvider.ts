import { type DataProvider, fetchUtils } from 'react-admin';

import { API_BASE_URL, getStoredToken, handleTokenRefresh, isTokenExpiredError } from './adminApi';

const resourceToEndpoint = {
  'pending-artists': `${API_BASE_URL}/admin/pending-artists`,
  users: `${API_BASE_URL}/admin/users`,
  bookings: `${API_BASE_URL}/admin/bookings`,
  artists: `${API_BASE_URL}/admin/artists`,
  reviews: `${API_BASE_URL}/admin/reviews`,
} as const;

export type AdminDataProvider = DataProvider & {
  activatePendingArtist: (artistId: string) => Promise<{ data: unknown }>;
  banUser: (resource: string, params: { id: string; reason: string }) => Promise<{ data: unknown }>;
  unbanUser: (resource: string, params: { id: string }) => Promise<{ data: unknown }>;
};

interface HttpError {
  status?: number;
  body?: { status?: number };
}

interface ArtistApiData {
  id: string;
  userId: string;
  [key: string]: unknown;
}

function isHttpError(error: unknown): error is HttpError {
  return typeof error === 'object' && error !== null && ('status' in error || 'body' in error);
}

async function httpClient(url: string, options: fetchUtils.Options = {}, skipRefresh = false) {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    return await fetchUtils.fetchJson(url, { ...options, headers });
  } catch (error) {
    // Handle 401 errors with token refresh
    if (!skipRefresh && isHttpError(error) && error.status === 401) {
      const errorBody = error.body as { code?: string } | undefined;

      // Check if this is a token expiration error
      if (isTokenExpiredError(errorBody)) {
        console.log('[AdminDataProvider] Token expired, attempting refresh');
        try {
          const newToken = await handleTokenRefresh();

          // Retry the original request with new token
          const retryHeaders = new Headers(headers);
          retryHeaders.set('Authorization', `Bearer ${newToken}`);

          return await fetchUtils.fetchJson(url, { ...options, headers: retryHeaders });
        } catch (refreshError) {
          console.error('[AdminDataProvider] Token refresh failed:', refreshError);
          throw error; // Throw original error if refresh fails
        }
      }
    }

    throw error;
  }
}

export const adminDataProvider: AdminDataProvider = {
  async getList(resource, params) {
    const endpoint = resourceToEndpoint[resource as keyof typeof resourceToEndpoint];
    if (!endpoint) {
      return Promise.reject(new Error(`Unsupported resource: ${resource}`));
    }

    const { page, perPage } = params.pagination ?? { page: 1, perPage: 25 };
    const { field, order } = params.sort ?? { field: 'createdAt', order: 'DESC' };

    // Build query params
    const queryParams = new URLSearchParams({
      page: String(page),
      perPage: String(perPage),
      sortField: field,
      sortOrder: order,
    });

    // Add filters
    const filters = params.filter ?? {};
    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === null || value === '') {
        continue;
      }

      if (key === 'q' || key === 'search') {
        queryParams.set('search', String(value));
        continue;
      }

      queryParams.set(key, String(value));
    }

    const url = `${endpoint}?${queryParams.toString()}`;
    const { json } = await httpClient(url);

    // For artists and pending-artists, swap id and userId so React Admin uses userId as the primary key
    let data = json.data ?? [];
    if (resource === 'artists' || resource === 'pending-artists') {
      data = data.map((item: ArtistApiData) => ({
        ...item,
        // Swap id and userId so userId becomes the primary identifier
        id: item.userId,
        artistProfileId: item.id, // Keep original id as artistProfileId
      }));
    }

    return {
      data,
      total: json.total ?? 0,
    };
  },

  async getOne(resource, params) {
    const endpoint = resourceToEndpoint[resource as keyof typeof resourceToEndpoint];
    if (!endpoint) {
      return Promise.reject(new Error(`Unsupported resource: ${resource}`));
    }

    try {
      const url = `${endpoint}/${params.id}`;
      const response = await httpClient(url);

      // Handle both {data: ...} and direct response formats
      let data = response.json.data || response.json;

      // For artists and pending-artists, ensure id is userId for consistency
      if ((resource === 'artists' || resource === 'pending-artists') && data.userId) {
        data = {
          ...data,
          id: data.userId, // Ensure id matches userId for React Admin consistency
          artistProfileId: data.id, // Preserve original id as artistProfileId
        };
      }

      return { data };
    } catch (error: unknown) {
      // If it's a 404, return a more graceful error
      const is404Error = isHttpError(error) && (error.status === 404 || error.body?.status === 404);
      if (is404Error) {
        return Promise.reject(new Error(`${resource} with id ${params.id} not found`));
      }

      throw error;
    }
  },

  async getMany() {
    return { data: [] };
  },

  async getManyReference() {
    return { data: [], total: 0 };
  },

  async update(resource, params) {
    const endpoint = resourceToEndpoint[resource as keyof typeof resourceToEndpoint];
    if (!endpoint) {
      return Promise.reject(new Error(`Unsupported resource: ${resource}`));
    }

    // For artists, the id is now userId, so use it directly
    const { json } = await httpClient(`${endpoint}/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    });

    // For artists, ensure id is userId for consistency
    let data = json.data;
    if (resource === 'artists' && data && data.userId) {
      data = {
        ...data,
        id: data.userId, // Ensure id matches userId for React Admin consistency
        artistProfileId: data.id, // Preserve original id as artistProfileId
      };
    }

    return { data };
  },

  async updateMany() {
    return Promise.reject(new Error('Update many not implemented'));
  },

  async create() {
    return Promise.reject(new Error('Create not implemented'));
  },

  async delete() {
    return Promise.reject(new Error('Delete not implemented'));
  },

  async deleteMany() {
    return Promise.reject(new Error('Delete many not implemented'));
  },

  async activatePendingArtist(artistId: string) {
    const endpoint = resourceToEndpoint['pending-artists'];
    if (!endpoint) {
      return Promise.reject(new Error('Activation endpoint not configured'));
    }

    const { json } = await httpClient(`${endpoint}/${artistId}/activate`, {
      method: 'POST',
    });

    return { data: json.data };
  },

  async banUser(_resource: string, params: { id: string; reason: string }) {
    const endpoint = resourceToEndpoint.users;
    if (!endpoint) {
      return Promise.reject(new Error('User endpoint not configured'));
    }

    const { json } = await httpClient(`${endpoint}/${params.id}/ban`, {
      method: 'POST',
      body: JSON.stringify({ reason: params.reason }),
    });

    return { data: json.data };
  },

  async unbanUser(_resource: string, params: { id: string }) {
    const endpoint = resourceToEndpoint.users;
    if (!endpoint) {
      return Promise.reject(new Error('User endpoint not configured'));
    }

    const { json } = await httpClient(`${endpoint}/${params.id}/unban`, {
      method: 'POST',
    });

    return { data: json.data };
  },
};
