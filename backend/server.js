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