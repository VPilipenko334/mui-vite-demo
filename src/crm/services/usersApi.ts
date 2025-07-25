const API_BASE_URL = 'https://user-api.builder-io.workers.dev/api';

export interface UserLocation {
  street: {
    number: number;
    name: string;
  };
  city: string;
  state: string;
  country: string;
  postcode: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  timezone: {
    offset: string;
    description: string;
  };
}

export interface UserName {
  title: string;
  first: string;
  last: string;
}

export interface UserLogin {
  uuid: string;
  username: string;
  password: string;
}

export interface UserDOB {
  date: string;
  age: number;
}

export interface UserRegistered {
  date: string;
  age: number;
}

export interface UserPicture {
  large: string;
  medium: string;
  thumbnail: string;
}

export interface User {
  login: UserLogin;
  name: UserName;
  gender: string;
  location: UserLocation;
  email: string;
  dob: UserDOB;
  registered: UserRegistered;
  phone: string;
  cell: string;
  picture: UserPicture;
  nat: string;
}

export interface UsersApiResponse {
  page: number;
  perPage: number;
  total: number;
  span: string;
  effectivePage: number;
  data: User[];
}

export interface CreateUserRequest {
  email: string;
  login: {
    username: string;
    password?: string;
  };
  name: {
    first: string;
    last: string;
    title?: string;
  };
  gender?: string;
  location?: {
    street?: {
      number: number;
      name: string;
    };
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

export interface UpdateUserRequest {
  email?: string;
  name?: {
    first?: string;
    last?: string;
    title?: string;
  };
  gender?: string;
  location?: {
    street?: {
      number?: number;
      name?: string;
    };
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
  phone?: string;
  cell?: string;
}

class UsersApiService {
  private async fetchApi(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getUsers(params: {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    span?: string;
  } = {}): Promise<UsersApiResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.perPage) searchParams.append('perPage', params.perPage.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.span) searchParams.append('span', params.span);

    const queryString = searchParams.toString();
    const endpoint = `/users${queryString ? `?${queryString}` : ''}`;
    
    return this.fetchApi(endpoint);
  }

  async getUser(id: string): Promise<User> {
    return this.fetchApi(`/users/${encodeURIComponent(id)}`);
  }

  async createUser(userData: CreateUserRequest): Promise<{ success: boolean; uuid: string; message: string }> {
    return this.fetchApi('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<{ success: boolean; message: string }> {
    return this.fetchApi(`/users/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    return this.fetchApi(`/users/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }
}

export const usersApiService = new UsersApiService();
