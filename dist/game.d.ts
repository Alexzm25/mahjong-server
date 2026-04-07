import type { GameState } from "./types";
export declare function createGame(pairCount: number): GameState;
export declare function addPlayer(state: GameState, id: string, name: string): GameState;
export declare function removePlayer(state: GameState, id: string): GameState;
export declare function selectTile(state: GameState, tileId: string, playerId: string): {
    newState: GameState;
    event: string | null;
};
export declare function checkMatch(state: GameState, t1Id: string, t2Id: string, playerId: string): {
    newState: GameState;
    isMatch: boolean;
};
//# sourceMappingURL=game.d.ts.map