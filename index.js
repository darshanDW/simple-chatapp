const http = require('http');
const serveHandler = require('serve-handler');
const WebSocketServer = require('ws');

// Serve static folder
const server = http.createServer((req, res) => {
    return serveHandler(req, res, { public: 'public' });
});

const wss = new WebSocketServer.Server({ server });

wss.on('connection', (client) => {
    console.log('Client connected!');
    client.on('message', (msg) => {
        console.log(`Message: ${msg}`);
        broadcast(msg);
    });
    client.on('close', () => {
        console.log('Client disconnected');
    });
    client.on('error', (err) => {
        console.error(`Client error: ${err}`);
    });
});

function broadcast(msg) {
    for (const client of wss.clients) {
        if (client.readyState === WebSocketServer.OPEN) {
            client.send(msg);
        }
    }
}

server.listen(8080, () => {
    console.log('Server listening on port 8080...');
});

process.on('SIGINT', () => {
    console.log('Shutting down gracefully...');
    wss.close(() => {
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
    });
});
