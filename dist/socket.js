"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = setupSocket;
const game_1 = require("./game");
let gameState = (0, game_1.createGame)(15); //15 pares es igual a 30 fichas
function setupSocket(io) {
    io.on('connection', (socket) => {
        socket.emit('game:state', gameState);
        socket.on('player:join', (name) => {
            const normalizedName = name.trim();
            if (!normalizedName)
                return;
            gameState = (0, game_1.addPlayer)(gameState, socket.id, normalizedName);
            io.emit('game:state', gameState);
        });
        socket.on('tile:select', (tileId) => {
            if (!tileId)
                return;
            const result = (0, game_1.selectTile)(gameState, tileId, socket.id);
            gameState = result.newState;
            io.emit('game:state', gameState);
        });
        socket.on('disconnect', () => {
            gameState = (0, game_1.removePlayer)(gameState, socket.id);
            io.emit('game:state', gameState);
        });
    });
}
//# sourceMappingURL=socket.js.map