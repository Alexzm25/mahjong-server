import { Server as SocketIOServer, Socket } from 'socket.io';
import { createGame, addPlayer, removePlayer, selectTile } from './game';

let gameState = createGame(15); //15 pares es igual a 30 fichas
 
export function setupSocket(io: SocketIOServer) : void {
    io.on('connection', (socket: Socket) => {
        socket.emit('game:state', gameState);

        socket.on('player:join', (name: string) => {
            const normalizedName = name.trim();
            if (!normalizedName) return;

            gameState = addPlayer(gameState, socket.id, normalizedName);
            io.emit('game:state', gameState);
        });

        socket.on('tile:select', (tileId: string) => {
            if (!tileId) return;

            const result = selectTile(gameState, tileId, socket.id);
            gameState = result.newState;
            io.emit('game:state', gameState);
        });

        socket.on('disconnect', () => {
            gameState = removePlayer(gameState, socket.id);
            io.emit('game:state', gameState);
        });
    });
}