import { useState } from 'react';
import { Download, Video, Music, Youtube, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { DownloadService } from '@/services/DownloadService';

interface DownloadStatus {
  isLoading: boolean;
  type: 'video' | 'audio' | null;
  message: string;
  status: 'idle' | 'downloading' | 'success' | 'error';
}

export const DownloadInterface = () => {
  const [url, setUrl] = useState('');
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>({
    isLoading: false,
    type: null,
    message: '',
    status: 'idle'
  });
  const { toast } = useToast();

  const isValidYouTubeUrl = (url: string): boolean => {
    const patterns = [
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/,
      /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+/,
      /^(https?:\/\/)?(www\.)?youtu\.be\/[\w-]+/
    ];
    return patterns.some(pattern => pattern.test(url));
  };

  const handleDownload = async (type: 'video' | 'audio') => {
    if (!url.trim()) {
      toast({
        title: "URL necessária",
        description: "Por favor, insira um link do YouTube",
        variant: "destructive",
      });
      return;
    }

    if (!isValidYouTubeUrl(url)) {
      toast({
        title: "URL inválida",
        description: "Por favor, insira um link válido do YouTube",
        variant: "destructive",
      });
      return;
    }

    setDownloadStatus({
      isLoading: true,
      type,
      message: `Iniciando download de ${type === 'video' ? 'vídeo' : 'áudio'}...`,
      status: 'downloading'
    });

    try {
      const result = await DownloadService.download(url, type);
      
      if (result.success) {
        setDownloadStatus({
          isLoading: false,
          type,
          message: `${type === 'video' ? 'Vídeo' : 'Áudio'} baixado com sucesso!`,
          status: 'success'
        });
        
        toast({
          title: "Download concluído!",
          description: `${type === 'video' ? 'Vídeo' : 'Áudio'} salvo na pasta Downloads`,
        });
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer download';
      setDownloadStatus({
        isLoading: false,
        type,
        message: errorMessage,
        status: 'error'
      });
      
      toast({
        title: "Erro no download",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = () => {
    switch (downloadStatus.status) {
      case 'downloading':
        return <Loader2 className="h-5 w-5 animate-spin text-info" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl glass-effect shadow-xl transition-smooth">
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <img 
                  src="/logo.svg" 
                  alt="Logo" 
                  className="h-16 w-auto mr-3"
                />
                <h1 className="text-4xl font-bold text-high-contrast">
                  YouTube Downloader
                </h1>
              </div>
              <p className="text-medium-contrast text-lg">
                Baixe vídeos e áudios do YouTube facilmente
              </p>
            </div>

          {/* URL Input */}
          <div className="space-y-4 mb-6">
            <label htmlFor="youtube-url" className="text-sm font-medium text-high-contrast">
              Link do YouTube
            </label>
            <Input
              id="youtube-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="text-lg py-6 bg-muted/50 border-border focus:ring-primary transition-smooth"
              disabled={downloadStatus.isLoading}
            />
          </div>

          {/* Download Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <Button
              onClick={() => handleDownload('video')}
              disabled={downloadStatus.isLoading}
              className="h-14 text-lg font-semibold bg-primary hover:bg-primary/90 glow-effect transition-bounce group"
            >
              <Video className="h-6 w-6 mr-2 group-hover:scale-110 transition-transform" />
              {downloadStatus.isLoading && downloadStatus.type === 'video' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Baixar Vídeo'
              )}
            </Button>

            <Button
              onClick={() => handleDownload('audio')}
              disabled={downloadStatus.isLoading}
              variant="secondary"
              className="h-14 text-lg font-semibold bg-secondary hover:bg-secondary/90 transition-bounce group"
            >
              <Music className="h-6 w-6 mr-2 group-hover:scale-110 transition-transform" />
              {downloadStatus.isLoading && downloadStatus.type === 'audio' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Baixar Áudio'
              )}
            </Button>
          </div>

          {/* Status Display */}
          {downloadStatus.message && (
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <div className="flex items-center space-x-3">
                {getStatusIcon()}
                <span className="text-sm font-medium text-high-contrast">
                  {downloadStatus.message}
                </span>
              </div>
              
              {downloadStatus.status === 'downloading' && (
                <div className="mt-3">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 text-center">
            <div className="text-sm text-medium-contrast space-y-2">
              <p>📝 <strong className="text-high-contrast">Como usar:</strong></p>
              <p>1. Cole o link do YouTube no campo acima</p>
              <p>2. Escolha entre baixar vídeo ou apenas áudio</p>
              <p>3. Os arquivos serão salvos na sua pasta Downloads</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
   </>
  );
};