import { type DataProvider, fetchUtils } from 'react-admin';

import { API_BASE_URL, getStoredToken } from './adminApi';

const resourceToEndpoint = {
  'pending-artists': `${API_BASE_URL}/admin/pending-artists`,
  users: `${API_BASE_URL}/admin/users`,
  bookings: `${API_BASE_URL}/admin/bookings`,
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

function isHttpError(error: unknown): error is HttpError {
  return typeof error === 'object' && error !== null && ('status' in error || 'body' in error);
}

async function httpClient(url: string, options: fetchUtils.Options = {}) {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return await fetchUtils.fetchJson(url, { ...options, headers });
}

export const adminDataProvider: AdminDataProvider = {
  async getList(resource, params) {
    console.log(
      '[AdminDataProvider] getList called for resource:',
      resource,
      'with params:',
      params
    );

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
    console.log('[AdminDataProvider] Making request to:', url);
    const { json } = await httpClient(url);

    return {
      data: json.data ?? [],
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
      if (response.json.data) {
        return { data: response.json.data };
      }
      return { data: response.json };
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

    const { json } = await httpClient(`${endpoint}/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    });

    return { data: json.data };
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
