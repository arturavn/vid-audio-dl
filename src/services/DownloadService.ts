interface DownloadResponse {
  success: boolean;
  message?: string;
  error?: string;
  filename?: string;
}

export class DownloadService {
  private static readonly API_BASE_URL = 'http://localhost:5001';

  static async download(url: string, type: 'video' | 'audio'): Promise<DownloadResponse> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/baixar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          type
        }),
      });

      if (!response.ok) {
        // Se o servidor backend não estiver rodando
        if (response.status === 0 || !response.status) {
          throw new Error('Backend não está rodando. Inicie o servidor Node.js na porta 5001');
        }
        
        throw new Error(`Erro do servidor: ${response.status}`);
      }

      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Erro no download:', error);
      
      // Erro de conexão (backend não rodando)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          error: 'Backend não encontrado. Certifique-se de que o servidor Node.js está rodando na porta 5001'
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Função para testar se o backend está online
  static async checkBackendStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/status`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}