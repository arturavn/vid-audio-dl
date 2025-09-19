import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Terminal, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  Copy,
  ExternalLink,
  Server,
  Folder
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DownloadService } from '@/services/DownloadService';

interface BackendInstructionsProps {
  onClose: () => void;
}

export const BackendInstructions = ({ onClose }: BackendInstructionsProps) => {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const { toast } = useToast();

  const checkBackend = async () => {
    setBackendStatus('checking');
    const isOnline = await DownloadService.checkBackendStatus();
    setBackendStatus(isOnline ? 'online' : 'offline');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Comando copiado para a área de transferência",
    });
  };

  // Verifica o backend quando o componente é montado
  useState(() => {
    checkBackend();
  });

  const commands = {
    backend: `// server.js
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const os = require('os');

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

// Endpoint para verificar status
app.get('/status', (req, res) => {
  res.json({ status: 'Backend rodando!' });
});

// Endpoint principal de download
app.post('/baixar', (req, res) => {
  const { url, type } = req.body;
  
  if (!url) {
    return res.status(400).json({ success: false, error: 'URL é obrigatória' });
  }

  // Pasta Downloads do usuário
  const downloadsPath = path.join(os.homedir(), 'Downloads');
  
  // Comando yt-dlp baseado no tipo
  let command;
  if (type === 'audio') {
    command = \`yt-dlp -x --audio-format mp3 "\${url}" -o "\${downloadsPath}/%(title)s.%(ext)s"\`;
  } else {
    command = \`yt-dlp -f "best[height<=720]" "\${url}" -o "\${downloadsPath}/%(title)s.%(ext)s"\`;
  }

  console.log('Executando:', command);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Erro:', error);
      return res.status(500).json({ 
        success: false, 
        error: \`Erro no download: \${error.message}\`
      });
    }

    console.log('Download concluído:', stdout);
    res.json({ 
      success: true, 
      message: \`\${type === 'video' ? 'Vídeo' : 'Áudio'} baixado com sucesso!\`
    });
  });
});

app.listen(PORT, () => {
  console.log(\`🚀 Backend rodando em http://localhost:\${PORT}\`);
});`,

    install: `npm init -y
npm install express cors
npm install -g yt-dlp`,

    run: `node server.js`
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-effect"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold gradient-text">Configuração do Backend</h2>
              <p className="text-muted-foreground">Configure o servidor Node.js para funcionar com yt-dlp</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge 
                variant={backendStatus === 'online' ? 'default' : 'destructive'}
                className="flex items-center space-x-1"
              >
                <Server className="h-3 w-3" />
                <span>
                  {backendStatus === 'checking' ? 'Verificando...' 
                   : backendStatus === 'online' ? 'Online' : 'Offline'}
                </span>
              </Badge>
              <Button variant="outline" size="sm" onClick={checkBackend}>
                Verificar
              </Button>
            </div>
          </div>

          {backendStatus === 'offline' && (
            <>
              {/* Pré-requisitos */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-warning" />
                  Pré-requisitos
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Node.js instalado</span>
                    <a 
                      href="https://nodejs.org" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center"
                    >
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>yt-dlp instalado globalmente</span>
                    <a 
                      href="https://github.com/yt-dlp/yt-dlp" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center"
                    >
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>FFmpeg (recomendado para áudio)</span>
                    <a 
                      href="https://ffmpeg.org/download.html" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center"
                    >
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Passos de instalação */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Folder className="h-5 w-5 mr-2 text-info" />
                    1. Crie uma pasta para o backend
                  </h3>
                  <div className="bg-muted rounded-lg p-4 relative">
                    <code className="text-sm">mkdir youtube-downloader-backend && cd youtube-downloader-backend</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={() => copyToClipboard('mkdir youtube-downloader-backend && cd youtube-downloader-backend')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Download className="h-5 w-5 mr-2 text-info" />
                    2. Instale as dependências
                  </h3>
                  <div className="bg-muted rounded-lg p-4 relative">
                    <pre className="text-sm whitespace-pre-wrap">{commands.install}</pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={() => copyToClipboard(commands.install)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Terminal className="h-5 w-5 mr-2 text-info" />
                    3. Crie o arquivo server.js
                  </h3>
                  <div className="bg-muted rounded-lg p-4 relative max-h-96 overflow-y-auto">
                    <pre className="text-xs whitespace-pre-wrap font-mono">{commands.backend}</pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={() => copyToClipboard(commands.backend)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Server className="h-5 w-5 mr-2 text-success" />
                    4. Execute o servidor
                  </h3>
                  <div className="bg-muted rounded-lg p-4 relative">
                    <code className="text-sm">{commands.run}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={() => copyToClipboard(commands.run)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    O servidor estará rodando em <code>http://localhost:5001</code>
                  </p>
                </div>
              </div>
            </>
          )}

          {backendStatus === 'online' && (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Backend configurado com sucesso!</h3>
              <p className="text-muted-foreground">
                O servidor está rodando e pronto para downloads
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};