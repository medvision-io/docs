import * as React from "react";
import { Dispatch, ReactElement, useReducer } from "react";

type State = {
  selectedVersion: string | null;
  selectedVersionSlug: string | null;
  selectedTagGroup: string | null;
  selectedPage: string | null;
  visibleElements: string[] | null;
};

export enum ActionKind {
  UPDATE = "UPDATE",
  CLEAR = "CLEAR",
  ADD_VISIBLE_ELEMENT = "ADD_VISIBLE_ELEMENT",
  REMOVE_VISIBLE_ELEMENT = "REMOVE_VISIBLE_ELEMENT",
}

type ActionInterface<T extends string, U> = {
  type: T;
  value: U;
  field: keyof State;
};

type AllActions =
  | ActionInterface<ActionKind.UPDATE, string | null>
  | ActionInterface<ActionKind.CLEAR, undefined>
  | ActionInterface<ActionKind.ADD_VISIBLE_ELEMENT, string>
  | ActionInterface<ActionKind.REMOVE_VISIBLE_ELEMENT, string>;

const defaultNavigationOptions: State = {
  selectedVersion: null,
  selectedVersionSlug: null,
  selectedTagGroup: null,
  selectedPage: null,
  visibleElements: [],
};

function reducer(state: State, action: AllActions) {
  switch (action.type) {
    case ActionKind.UPDATE:
      return { ...state, [action.field]: action.value };
    case ActionKind.CLEAR:
      return { ...defaultNavigationOptions };
    case ActionKind.ADD_VISIBLE_ELEMENT:
      return {
        ...state,
        visibleElements: [...state.visibleElements, action.value],
      };
    case ActionKind.REMOVE_VISIBLE_ELEMENT:
      return {
        ...state,
        visibleElements: state.visibleElements.filter(
          (el) => el !== action.value
        ),
      };
    default:
      return state;
  }
}

export const NavigationContext = React.createContext<
  [State, Dispatch<AllActions>] | []
>([]);

interface Props {
  children: ReactElement;
  initialState?: State;
}

export const NavigationContextProvider: React.FC<Props> = (props) => {
  const [state, dispatch] = useReducer(
    reducer,
    props.initialState || defaultNavigationOptions
  );

  return (
    <NavigationContext.Provider value={[state, dispatch]}>
      {props.children}
    </NavigationContext.Provider>
  );
};
