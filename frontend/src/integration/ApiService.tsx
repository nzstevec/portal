import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import FeedbackDto from '../model/FeedbackDto';

// Existing interfaces
interface User {
  id: number;
  name: string;
  email: string;
}

interface ApiError {
  message: string;
  code: string;
}

interface BaseApiResponse {
  received: string;
  status: string | number;
  message: string;
}

class ApiService {
  private api: AxiosInstance;
  private origin = window.location.origin;

  constructor() {
    this.api = axios.create({
      baseURL: origin,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      (config) => {
        // Add authentication token if available
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        // Handle common error scenarios
        if (error.response?.status === 401) {
          // Redirect to login page or refresh token
        }
        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  private normalizeError(error: AxiosError<ApiError>): BaseApiResponse {
    return {
      received: new Date().toISOString(),
      status: error.response?.status || 'UNKNOWN_STATUS',
      message: error.response?.data?.message || 'An unexpected error occurred',
    };
  }

  async getUsers(): Promise<User[]> {
    try {
      const response: AxiosResponse<User[]> = await this.api.get('/users');
      return response.data;
    } catch (error) {
      throw this.normalizeError(error as AxiosError<ApiError>);
    }
  }

  async getUserById(id: number): Promise<User> {
    try {
      const response: AxiosResponse<User> = await this.api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw this.normalizeError(error as AxiosError<ApiError>);
    }
  }


  // New method to create feedback
  async createFeedback(feedbackData: FeedbackDto): Promise<BaseApiResponse> {
    try {
      const response: AxiosResponse<BaseApiResponse> = await this.api.post(
        '/api/feedback',
        feedbackData
      );
      return response.data;
    } catch (error) {
      throw this.normalizeError(error as AxiosError<ApiError>);
    }
  }
}

export const apiService = new ApiService();
export default BaseApiResponse;
