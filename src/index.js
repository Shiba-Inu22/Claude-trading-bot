require('dotenv').config();

console.log('⏹️ Bot stopped - No processes running');
console.log('Waiting for further instructions...');

// Пустой скрипт чтобы просто работать но ничего не делать
const http = require('http');
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot is paused ⏹️');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ HTTP server listening on port ${PORT}`);
  console.log('💡 Bot is paused - Telegram polling disabled');
});
