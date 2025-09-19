# YouTube Downloader - Guia de Configuração Backend

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 16 ou superior)
- **yt-dlp** (globalmente via npm ou pip)
- **FFmpeg** (recomendado para downloads de áudio)

### Instalação dos pré-requisitos:

```bash
# Instalar yt-dlp globalmente
npm install -g yt-dlp

# OU via pip (Python)
pip install yt-dlp

# Instalar FFmpeg
# Windows (via Chocolatey): choco install ffmpeg
# macOS (via Homebrew): brew install ffmpeg
# Ubuntu/Debian: sudo apt install ffmpeg
```

## 🚀 Configuração do Backend

### 1. Crie uma pasta para o backend

```bash
mkdir youtube-downloader-backend
cd youtube-downloader-backend
```

### 2. Inicialize o projeto Node.js

```bash
npm init -y
```

### 3. Instale as dependências

```bash
npm install express cors
```

### 4. Crie o arquivo server.js

```javascript
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
    command = `yt-dlp -x --audio-format mp3 "${url}" -o "${downloadsPath}/%(title)s.%(ext)s"`;
  } else {
    command = `yt-dlp -f "best[height<=720]" "${url}" -o "${downloadsPath}/%(title)s.%(ext)s"`;
  }

  console.log('Executando:', command);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Erro:', error);
      return res.status(500).json({ 
        success: false, 
        error: `Erro no download: ${error.message}`
      });
    }

    console.log('Download concluído:', stdout);
    res.json({ 
      success: true, 
      message: `${type === 'video' ? 'Vídeo' : 'Áudio'} baixado com sucesso!`
    });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});
```

### 5. Execute o servidor

```bash
node server.js
```

O servidor estará rodando em `http://localhost:5001`

## 🎯 Como Usar

1. Execute o backend conforme as instruções acima
2. Abra o frontend no navegador
3. Cole um link do YouTube no campo de entrada
4. Clique em "Baixar Vídeo" ou "Baixar Áudio"
5. Os arquivos serão salvos na sua pasta Downloads

## 🔧 Personalização

### Alterar qualidade do vídeo:
```javascript
// Para 1080p
command = `yt-dlp -f "best[height<=1080]" "${url}" -o "${downloadsPath}/%(title)s.%(ext)s"`;

// Para melhor qualidade disponível
command = `yt-dlp -f "best" "${url}" -o "${downloadsPath}/%(title)s.%(ext)s"`;
```

### Alterar formato de áudio:
```javascript
// Para WAV
command = `yt-dlp -x --audio-format wav "${url}" -o "${downloadsPath}/%(title)s.%(ext)s"`;

// Para OGG
command = `yt-dlp -x --audio-format ogg "${url}" -o "${downloadsPath}/%(title)s.%(ext)s"`;
```

### Alterar pasta de destino:
```javascript
// Para uma pasta específica
const downloadsPath = 'C:\\Users\\SeuUsuario\\Desktop\\Downloads';
// ou
const downloadsPath = '/home/seuusuario/Downloads';
```

## 🚨 Problemas Comuns

### "yt-dlp não é reconhecido como comando"
- Certifique-se de que yt-dlp está instalado globalmente
- Verifique se está no PATH do sistema

### "FFmpeg not found"
- Instale FFmpeg e adicione ao PATH
- Necessário para conversão de áudio

### Erro de CORS
- O backend já inclui configuração CORS
- Certifique-se de que está rodando na porta 5001

### Permissões de pasta
- Verifique se tem permissão de escrita na pasta Downloads
- Execute com privilégios de administrador se necessário

## 📝 Notas Importantes

- Este é um servidor local, não para produção
- Respeite os termos de uso do YouTube
- Use apenas para conteúdo que você tem direito de baixar
- O yt-dlp baixa apenas vídeos públicos

## 🔄 Atualizações

Para manter o yt-dlp atualizado:

```bash
# Via npm
npm update -g yt-dlp

# Via pip
pip install --upgrade yt-dlp
```