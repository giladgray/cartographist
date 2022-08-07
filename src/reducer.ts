import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useReducer } from 'react';

export interface GameState {
  // total score
  score: number;
  // points earned from last move
  lastPoints: number;
  // the current level of the target.
  level: number;
  // the current target score, expressed as delta from `lastTarget`
  target: number;
  // the previous target score
  lastTarget: number;
}

const INITIAL: GameState = {
  score: 0,
  lastPoints: 0,
  lastTarget: 0,
  level: 1,
  target: 10,
};

const game = createSlice({
  name: 'carto',
  initialState: INITIAL,
  reducers: {
    reset: () => INITIAL,
    add: (state, { payload: points }: PayloadAction<number>) => {
      state.lastPoints = points;
      state.score += points;
      // increase level when reaching target
      if (state.score - state.lastTarget >= state.target) {
        state.level++;
        state.lastTarget += state.target;
        state.target = Math.floor(state.target * 1.2);
      }
    },
  },
});

export function useGameReducer() {
  const [state, dispatch] = useReducer(game.reducer, INITIAL);

  const actions = {
    reset: () => dispatch(game.actions.reset()),
    add: (points: number) => dispatch(game.actions.add(points)),
  };
  return [state, actions] as const;
}
