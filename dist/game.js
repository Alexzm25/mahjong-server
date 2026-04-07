"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGame = createGame;
exports.addPlayer = addPlayer;
exports.removePlayer = removePlayer;
exports.selectTile = selectTile;
exports.checkMatch = checkMatch;
const SYMBOLS = [
    '🀇', '🀈', '🀉', '🀊', '🀋', '🀌', '🀍', '🀎', '🀏',
    '🀙', '🀚', '🀛', '🀜', '🀝', '🀞', '🀟', '🀠', '🀡',
    '🀀', '🀁', '🀂', '🀃', '🀄', '🀅', '🀆'
];
function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
function createGame(pairCount) {
    const symbols = SYMBOLS.slice(0, pairCount);
    const paired = symbols.flatMap((symbol, index) => [
        { id: `tile-${index}-a`, symbol, isFlipped: false, isMatched: false, lockedBy: null },
        { id: `tile-${index}-b`, symbol, isFlipped: false, isMatched: false, lockedBy: null },
    ]);
    return {
        tiles: shuffle(paired),
        players: [],
        scoreHistory: [],
        isGameOver: false,
        startTime: null,
    };
}
function addPlayer(state, id, name) {
    const existing = state.players.find(p => p.name === name);
    if (existing) {
        return {
            ...state,
            players: state.players.map(p => p.name === name ? { ...p, id, isConnected: true } : p),
        };
    }
    const newPlayer = { id, name, score: 0, isConnected: true };
    return {
        ...state,
        players: [...state.players, newPlayer],
        startTime: state.startTime ?? Date.now(),
    };
}
function removePlayer(state, id) {
    return {
        ...state,
        players: state.players.map(p => p.id === id ? { ...p, isConnected: false } : p),
        tiles: state.tiles.map(t => t.lockedBy === id ? { ...t, lockedBy: null, isFlipped: false } : t),
    };
}
function selectTile(state, tileId, playerId) {
    const tile = state.tiles.find(t => t.id === tileId);
    if (!tile || tile.isMatched || (tile.lockedBy && tile.lockedBy !== playerId)) {
        return { newState: state, event: null };
    }
    const previousTile = state.tiles.find(t => t.lockedBy === playerId && t.id !== tileId);
    const stateWithTile = {
        ...state,
        tiles: state.tiles.map(t => t.id === tileId ? { ...t, lockedBy: playerId, isFlipped: true } : t),
    };
    if (previousTile) {
        const { newState, isMatch } = checkMatch(stateWithTile, previousTile.id, tileId, playerId);
        return {
            newState,
            event: isMatch ? 'match' : 'no-match',
        };
    }
    return { newState: stateWithTile, event: null };
}
function checkMatch(state, t1Id, t2Id, playerId) {
    const t1 = state.tiles.find(t => t.id === t1Id);
    const t2 = state.tiles.find(t => t.id === t2Id);
    if (!t1 || !t2)
        return { newState: state, isMatch: false };
    const isMatch = t1.symbol === t2.symbol;
    const snapshot = {
        timestamp: Date.now(),
        scores: Object.fromEntries(state.players.map(p => [p.name, p.score])),
    };
    if (isMatch) {
        const newTiles = state.tiles.map(t => t.id === t1Id || t.id === t2Id
            ? { ...t, isMatched: true, isFlipped: true, lockedBy: null }
            : t);
        const newPlayers = state.players.map(p => p.id === playerId ? { ...p, score: p.score + 1 } : p);
        const isGameOver = newTiles.every(t => t.isMatched);
        return {
            newState: {
                ...state,
                tiles: newTiles,
                players: newPlayers,
                scoreHistory: [...state.scoreHistory, snapshot],
                isGameOver,
            },
            isMatch: true,
        };
    }
    else {
        const newTiles = state.tiles.map(t => t.id === t1Id || t.id === t2Id
            ? { ...t, lockedBy: null, isFlipped: false }
            : t);
        return {
            newState: {
                ...state,
                tiles: newTiles,
                scoreHistory: [...state.scoreHistory, snapshot],
            },
            isMatch: false,
        };
    }
}
//# sourceMappingURL=game.js.map