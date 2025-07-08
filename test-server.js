const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('Basic Node Server Works!');
});
server.listen(3333, 'localhost', () => {
  console.log('Server running on http://localhost:3333');
});
