import { useEffect, useReducer } from 'react';
import { playSound } from '../utils/sound';
import { formatTime } from '../utils/time';

const SESSION_TYPES = {
  WORK: 'work',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak',
};

export const SESSION_LABELS = {
  [SESSION_TYPES.WORK]: 'Work',
  [SESSION_TYPES.SHORT_BREAK]: 'Short Break',
  [SESSION_TYPES.LONG_BREAK]: 'Long Break',
};

const DEFAULT_SETTINGS = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
};

function durationFor(sessionType, settings) {
  switch (sessionType) {
    case SESSION_TYPES.WORK:
      return settings.workDuration * 60;
    case SESSION_TYPES.SHORT_BREAK:
      return settings.shortBreakDuration * 60;
    case SESSION_TYPES.LONG_BREAK:
      return settings.longBreakDuration * 60;
    default:
      return 0;
  }
}

function isValidSetting(name, value) {
  if (!Number.isFinite(value) || value < 1) return false;

  switch (name) {
    case 'workDuration':
      return value <= 120;
    case 'shortBreakDuration':
      return value <= 60;
    case 'longBreakDuration':
      return value <= 90;
    case 'sessionsBeforeLongBreak':
      return value <= 12;
    default:
      return false;
  }
}

const initialState = {
  status: 'idle',
  sessionType: SESSION_TYPES.WORK,
  timeLeft: durationFor(SESSION_TYPES.WORK, DEFAULT_SETTINGS),
  endsAt: null,
  settings: DEFAULT_SETTINGS,
  completedWorkSessions: 0,
  workSessionsInCycle: 0,
  phaseCompleted: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'START': {
      if (state.status === 'running' || state.timeLeft <= 0) return state;

      return {
        ...state,
        status: 'running',
        endsAt: action.now + state.timeLeft * 1000,
        phaseCompleted: false,
      };
    }

    case 'PAUSE': {
      if (state.status !== 'running' || !state.endsAt) return state;

      const remaining = Math.max(
        0,
        Math.ceil((state.endsAt - action.now) / 1000)
      );

      if (remaining <= 0) {
        return {
          ...state,
          status: 'idle',
          timeLeft: 0,
          endsAt: null,
          phaseCompleted: true,
        };
      }

      return {
        ...state,
        status: 'paused',
        timeLeft: remaining,
        endsAt: null,
      };
    }

    case 'STOP': {
      return {
        ...state,
        status: 'idle',
        timeLeft: durationFor(state.sessionType, state.settings),
        endsAt: null,
        phaseCompleted: false,
      };
    }

    case 'TICK': {
      if (state.status !== 'running' || !state.endsAt) return state;

      const remainingMs = state.endsAt - action.now;

      if (remainingMs <= 0) {
        return {
          ...state,
          status: 'idle',
          timeLeft: 0,
          endsAt: null,
          phaseCompleted: true,
        };
      }

      const nextTimeLeft = Math.ceil(remainingMs / 1000);

      if (nextTimeLeft === state.timeLeft) return state;

      return {
        ...state,
        timeLeft: nextTimeLeft,
      };
    }

    case 'ADVANCE': {
      if (!state.phaseCompleted) return state;

      let nextSessionType = SESSION_TYPES.WORK;
      let completedWorkSessions = state.completedWorkSessions;
      let workSessionsInCycle = state.workSessionsInCycle;

      if (state.sessionType === SESSION_TYPES.WORK) {
        completedWorkSessions += 1;
        workSessionsInCycle += 1;

        if (workSessionsInCycle >= state.settings.sessionsBeforeLongBreak) {
          nextSessionType = SESSION_TYPES.LONG_BREAK;
          workSessionsInCycle = 0;
        } else {
          nextSessionType = SESSION_TYPES.SHORT_BREAK;
        }
      } else {
        nextSessionType = SESSION_TYPES.WORK;
      }

      return {
        ...state,
        sessionType: nextSessionType,
        completedWorkSessions,
        workSessionsInCycle,
        timeLeft: durationFor(nextSessionType, state.settings),
        status: 'idle',
        endsAt: null,
        phaseCompleted: false,
      };
    }

    case 'UPDATE_SETTING': {
      const { name, value } = action.payload;
      const parsedValue = Number(value);

      if (!isValidSetting(name, parsedValue)) return state;

      const settings = {
        ...state.settings,
        [name]: parsedValue,
      };

      let timeLeft = state.timeLeft;

      if (state.status === 'idle') {
        timeLeft = durationFor(state.sessionType, settings);
      }

      return {
        ...state,
        settings,
        timeLeft,
      };
    }

    case 'RESET_SESSIONS': {
      return {
        ...state,
        status: 'idle',
        sessionType: SESSION_TYPES.WORK,
        timeLeft: durationFor(SESSION_TYPES.WORK, state.settings),
        endsAt: null,
        completedWorkSessions: 0,
        workSessionsInCycle: 0,
        phaseCompleted: false,
      };
    }

    default:
      return state;
  }
}

export function usePomodoro() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (state.status !== 'running') return undefined;

    const intervalId = setInterval(() => {
      dispatch({
        type: 'TICK',
        now: Date.now(),
      });
    }, 250);

    return () => clearInterval(intervalId);
  }, [state.status, dispatch]);

  useEffect(() => {
    if (!state.phaseCompleted) return;

    playSound();
    dispatch({ type: 'ADVANCE' });
  }, [state.phaseCompleted, dispatch]);

  useEffect(() => {
    document.title = `${formatTime(state.timeLeft)} - ${
      SESSION_LABELS[state.sessionType]
    }`;
  }, [state.timeLeft, state.sessionType]);

  const actions = {
    start: () => dispatch({ type: 'START', now: Date.now() }),
    pause: () => dispatch({ type: 'PAUSE', now: Date.now() }),
    stop: () => dispatch({ type: 'STOP' }),
    resetSessions: () => dispatch({ type: 'RESET_SESSIONS' }),
    updateSetting: (name, value) =>
      dispatch({
        type: 'UPDATE_SETTING',
        payload: { name, value },
      }),
  };

  return { state, actions };
}