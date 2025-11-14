import axios, { AxiosInstance } from 'axios';

export interface LabelStudioClientOptions {
  baseUrl: string;
  token: string;
}

export class LabelStudioClient {
  private http: AxiosInstance;

  constructor(opts: LabelStudioClientOptions) {
    this.http = axios.create({
      baseURL: opts.baseUrl,
      headers: {
        Authorization: `Token ${opts.token}`,
      },
    });
  }

  async ensureProject(name: string, labelConfig: string): Promise<number> {
    const existing = await this.http.get('/api/projects/', { params: { title: name } });
    if (existing.data && existing.data.length > 0) {
      return existing.data[0].id;
    }
    const response = await this.http.post('/api/projects/', {
      title: name,
      label_config: labelConfig,
    });
    return response.data.id;
  }

  async importTasks(projectId: number, tasks: unknown[]): Promise<void> {
    await this.http.post(`/api/projects/${projectId}/import`, tasks);
  }

  async exportAnnotations(projectId: number): Promise<any[]> {
    const response = await this.http.get(`/api/projects/${projectId}/export`, {
      params: { exportType: 'JSON' },
    });
    return response.data;
  }
}
