import { SidebarStructureDto } from '@/lib/types/supabase.type';

class SidebarService {
  private async fetchApi<T>(
    endpoint: string,
    options: RequestInit,
  ): Promise<T> {
    const res = await fetch(`/api/sidebar/${endpoint}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });

    const payload = await res.json();
    if (!res.ok) {
      throw new Error(payload.message || `Request to ${endpoint} failed.`);
    }

    return payload as T;
  }

  async getDefaultOptions(): Promise<SidebarStructureDto[]> {
    return this.fetchApi<SidebarStructureDto[]>('data', {
      method: 'GET',
    });
  }
}

export const sidebarService = new SidebarService();
