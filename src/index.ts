import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { setupSocket } from './socket';

const app = express();

app.use(
	cors({
		origin: 'http://localhost:5173',
	})
);

app.get('/', (req, res) => {
	res.send('Memory Game Server is running');
});

const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
	cors: {
		origin: 'http://localhost:5173',
		methods: ['GET', 'POST'],
	},
});

setupSocket(io);

const PORT = 3000;
httpServer.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});