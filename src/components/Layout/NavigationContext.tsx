import * as React from 'react';
import {Dispatch, ReactElement, useReducer} from "react";


type State = {
  selectedVersion: string | null,
  selectedTagGroup: string | null,
  selectedPage: string | null,
};

enum ActionKind {
  UPDATE = 'UPDATE',
  CLEAR = 'CLEAR',
}


type ActionInterface<T extends string, U> = {
  type: T;
  value: U;
  field: keyof State;
};

type AllActions = ActionInterface<ActionKind.UPDATE, string | null> | ActionInterface<ActionKind.CLEAR, undefined>;

const defaultNavigationOptions: State = {
  selectedVersion: null,
  selectedTagGroup: null,
  selectedPage: null,
}

function reducer(state: State, action: AllActions) {
  switch (action.type) {
    case 'UPDATE':
      return { ...state, [action.field]: action.value };
    case 'CLEAR':
      return { ...defaultNavigationOptions };
    default:
      return state;
  }
}

export const NavigationContext = React.createContext<[State, Dispatch<AllActions>] | []>([]);

interface Props {
  children: ReactElement;
  initialState?: State;
}

export const NavigationContextProvider: React.FC<Props> = props => {
  const [state, dispatch] = useReducer(reducer, props.initialState || defaultNavigationOptions);

  return (
    <NavigationContext.Provider value={[state, dispatch]}>
      {props.children}
    </NavigationContext.Provider>
  );
};