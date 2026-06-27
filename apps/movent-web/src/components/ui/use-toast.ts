'use client';

import * as React from 'react';
import type { ToastProps } from './toast';

type Toast = ToastProps & { id: string; title?: string; description?: string };

type State = { toasts: Toast[] };
type Action =
  | { type: 'ADD'; toast: Toast }
  | { type: 'DISMISS'; id: string }
  | { type: 'REMOVE'; id: string };

let count = 0;
const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((l) => l(memoryState));
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD':
      return { toasts: [action.toast, ...state.toasts].slice(0, 3) };
    case 'DISMISS':
      return { toasts: state.toasts.map((t) => (t.id === action.id ? { ...t, open: false } : t)) };
    case 'REMOVE':
      return { toasts: state.toasts.filter((t) => t.id !== action.id) };
  }
}

export function toast(props: Omit<Toast, 'id'>) {
  const id = String(++count);
  dispatch({
    type: 'ADD',
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dispatch({ type: 'DISMISS', id });
      },
    },
  });
  return { id, dismiss: () => dispatch({ type: 'DISMISS', id }) };
}

export function useToast() {
  const [state, setState] = React.useState(memoryState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const i = listeners.indexOf(setState);
      if (i > -1) listeners.splice(i, 1);
    };
  }, []);
  return { ...state, toast, dismiss: (id: string) => dispatch({ type: 'DISMISS', id }) };
}
