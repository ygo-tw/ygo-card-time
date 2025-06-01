import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';

// API 響應介面
interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  success: boolean;
}

// 請求配置介面
interface RequestConfig extends AxiosRequestConfig {
  showLoading?: boolean;
  showError?: boolean;
}

class ApiService {
  private instance: AxiosInstance;
  private loading = ref(false);

  constructor() {
    // 創建 axios 實例
    this.instance = axios.create({
      baseURL:
        process.env.NODE_ENV === 'production'
          ? '/api'
          : 'http://localhost:3000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 設置請求攔截器
    this.setupRequestInterceptor();

    // 設置響應攔截器
    this.setupResponseInterceptor();
  }

  // 請求攔截器
  private setupRequestInterceptor() {
    this.instance.interceptors.request.use(
      (config: any) => {
        // 顯示 loading
        if (config.showLoading !== false) {
          this.loading.value = true;
        }

        // 添加 token
        const token = useCookie('token');
        if (token.value) {
          config.headers.Authorization = `Bearer ${token.value}`;
        }

        console.log(
          '🚀 API Request:',
          config.method?.toUpperCase(),
          config.url,
          config.data || config.params
        );
        return config;
      },
      error => {
        this.loading.value = false;
        return Promise.reject(error);
      }
    );
  }

  // 響應攔截器
  private setupResponseInterceptor() {
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        this.loading.value = false;

        console.log('API Response:', response.config.url, response.data);

        // 檢查業務狀態碼
        if (response.data.code !== 200 && response.data.success !== true) {
          const error = new Error(response.data.message || '請求失敗');
          return Promise.reject(error);
        }

        return response;
      },
      error => {
        this.loading.value = false;

        console.error(
          'API Error:',
          error.config?.url,
          error.response?.data || error.message
        );

        // 處理不同的錯誤狀態
        if (error.response) {
          const { status, data } = error.response;

          switch (status) {
            case 401: {
              // 未授權，清除 token 並跳轉登入
              const token = useCookie('token');
              token.value = null;
              navigateTo('/login');
              break;
            }
            case 403:
              console.error('權限不足');
              break;
            case 404:
              console.error('請求的資源不存在');
              break;
            case 500:
              console.error('伺服器內部錯誤');
              break;
            default:
              console.error(`請求錯誤: ${status}`);
          }

          return Promise.reject(
            new Error(data?.message || `HTTP ${status} 錯誤`)
          );
        } else if (error.request) {
          return Promise.reject(new Error('網路連線錯誤'));
        } else {
          return Promise.reject(new Error('請求設定錯誤'));
        }
      }
    );
  }

  // GET 請求
  async get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    const response = await this.instance.get(url, config);
    return response.data;
  }

  // POST 請求
  async post<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    const response = await this.instance.post(url, data, config);
    return response.data;
  }

  // PUT 請求
  async put<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    const response = await this.instance.put(url, data, config);
    return response.data;
  }

  // DELETE 請求
  async delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    const response = await this.instance.delete(url, config);
    return response.data;
  }

  // PATCH 請求
  async patch<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    const response = await this.instance.patch(url, data, config);
    return response.data;
  }

  // 獲取 loading 狀態
  get isLoading() {
    return this.loading;
  }
}

// 創建 API 實例
export const api = new ApiService();

// 導出類型
export type { ApiResponse, RequestConfig };
