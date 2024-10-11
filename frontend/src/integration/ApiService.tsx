import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { config } from './config';
import FeedbackDto from '../model/FeedbackDto';
import CreatePresignedUrlDto from '../model/CreatePresignedUrlDto';
import PresignedUrlDto from '../model/PresignedUrlDto';
import QueryRequestDto from '../model/QueryRequestDto';
import QueryResponseDto from '../model/QueryResponseDto';
import QueryResponseDtoImpl from '../model/QueryResponseDto';
import DocAuditRequestDto from '../model/DocAuditRequestDto';
import DocAuditResponseDto from '../model/DocAuditResponseDto';

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

interface GetUploadedFilenamesResponse {
  filenames: string[];
}

class ApiService {
  private api: AxiosInstance;
  private origin = window.location.origin;

  constructor() {
    this.api = axios.create({
      baseURL: origin,
      timeout: 180000,
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

  async createFeedback(feedbackData: FeedbackDto): Promise<BaseApiResponse> {
    try {
      const response: AxiosResponse<BaseApiResponse> = await this.api.post(
        config.postFeedbackEndpoint,
        feedbackData
      );
      return response.data;
    } catch (error) {
      throw this.normalizeError(error as AxiosError<ApiError>);
    }
  }

  async createPresignedUrl(
    createPresignedUrlData: CreatePresignedUrlDto
  ): Promise<PresignedUrlDto> {
    try {
      const response: AxiosResponse<PresignedUrlDto> = await this.api.post(
        config.getPresignedUrlEndpoint,
        createPresignedUrlData
      );
      return response.data;
    } catch (error) {
      throw this.normalizeError(error as AxiosError<ApiError>);
    }
  }

  async getUploadedFilenames(
    userid: string
  ): Promise<string[]> {
    try {
      const endpoint = `${config.getUploadedFilenamesEndpoint}/${userid}`;
      const response: AxiosResponse<GetUploadedFilenamesResponse> = await this.api.get(endpoint);

      return response.data.filenames;
    } catch (error) {
      throw this.normalizeError(error as AxiosError<ApiError>);
    }
  }

  async deleteUploadedFiles(
    userid: string, filename: string
  ): Promise<null> {
    try {
      const endpoint = `${config.deleteUploadedFilesEndpoint}/${userid}/${filename}`;
      const response: AxiosResponse<null> = await this.api.delete(endpoint);

      return response.data;
    } catch (error) {
      throw this.normalizeError(error as AxiosError<ApiError>);
    }
  }

  async uploadToPresignedUrl(
    presignedUrl: string,
    file: File,
    setFiles: any
  ): Promise<BaseApiResponse> {
    console.log('uploadToPresignedUrl ', presignedUrl);
    console.log('upload file is ', file);
    try {
      const response: AxiosResponse<BaseApiResponse> = await axios.put(
        presignedUrl,
        file,
        {
          headers: {
            'Content-Type': file.type,
          },
          onUploadProgress: (progressEvent) => {
            const total = progressEvent.total ?? 1;
            const progress = Math.round((progressEvent.loaded * 100) / total);
            setFiles((prevFiles: any[]) =>
              prevFiles.map((f) => (f.file === file ? { ...f, progress } : f))
            );
          },
        }
      );
      console.log('uploadToPresignedUrl response ', response);
      return response.data;
    } catch (error) {
      console.log('uploadToPresignedUrl error ', error);
      throw this.normalizeError(error as AxiosError<ApiError>);
    }
  }

  async sendQueryRequest(
    queryRequestDto: QueryRequestDto
  ): Promise<QueryResponseDto> {
    try {
      const response: AxiosResponse<QueryResponseDto> = await this.api.post(
        config.postAiQueryEndpoint,
        queryRequestDto
      );

      const data = response.data;
      return new QueryResponseDtoImpl(data.received, data.status, data.ai_response);

    } catch (error) {
      throw this.normalizeError(error as AxiosError<ApiError>);
    }
  }

  async sendDocAuditRequest(
    docAuditRequestDto: DocAuditRequestDto
  ): Promise<DocAuditResponseDto> {
    try {
      const response: AxiosResponse<DocAuditResponseDto> = await this.api.post(
        config.postAiQueryEndpoint,
        docAuditRequestDto
      );

      const data = response.data;
      return new QueryResponseDtoImpl(data.received, data.status, data.ai_response);

    } catch (error) {
      throw this.normalizeError(error as AxiosError<ApiError>);
    }
  }
}

export const apiService = new ApiService();
export default BaseApiResponse;
