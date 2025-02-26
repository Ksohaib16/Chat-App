const express = require('express');
const app = express();
const cors = require('cors');
const WebSocket = require('ws');
const authRoute = require('./routes/authRouter');
const userRoute = require('./routes/userRouter');
const http = require('http');
const server = http.createServer(app);

const wss = new WebSocket.Server({ server });
const clients = new Map();

wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const userId = url.searchParams.get('userId');

    if (!userId) return ws.close();

    console.log('Connected', userId);
    clients.set(userId, ws);
    console.log('Total clients:', clients.size);

    //Online user sender function
    const broadcastUsers = () => {
        const activeUsers = Array.from(clients.keys());
        clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(
                    JSON.stringify({
                        type: 'users',
                        users: activeUsers,
                    }),
                );
            }
        });
    };
    broadcastUsers();

    //ws connection
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (!data.receiverId || !data.conversationId) {
                throw new Error('Missing required fields');
            }

            const targetWs = clients.get(data.receiverId);

            if (targetWs?.readyState === WebSocket.OPEN) {
                targetWs.send(
                    JSON.stringify({
                        type: 'message',
                        content: data.content,
                        senderId: data.senderId,
                        receiverId: data.receiverId,
                        conversationId: data.conversationId,
                        timestamp: new Date().toISOString(),
                    }),
                );
            } else {
                ws.send(
                    JSON.stringify({
                        type: 'error',
                        content: 'User is offline',
                        timestamp: new Date().toISOString(),
                    }),
                );
            }
        } catch (error) {
            console.error('Message handling error:', error);
        }
    });

    ws.on('close', () => {
        clients.delete(userId);
        broadcastUsers();
    });
});

app.use(express.json());
app.use(cors());
app.get('/', (req, res) => res.send('Hello World!'));
app.use('/v1/auth', authRoute);
app.use('/v1/user', userRoute);

server.listen(3000, () => {
    console.log('Server running on port 3000');
});

module.exports = { app, server };
