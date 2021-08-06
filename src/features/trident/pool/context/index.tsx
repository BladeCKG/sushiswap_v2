import React, { createContext, useContext, useReducer, Dispatch, useMemo } from 'react'
import reducer from './reducer'
import { Reducer, State } from './types'

const initialState: State = {
  sortType: 0,
  searchQuery: null,
  filters: {
    poolTypes: [],
    feeTiers: [],
  },
}

export const TridentPoolPageContext = createContext<{ state: State; dispatch: Dispatch<any> }>({
  state: initialState,
  dispatch: () => null,
})

export const TridentPoolPageContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer<React.Reducer<State, Reducer>>(reducer, initialState)

  return (
    <TridentPoolPageContext.Provider value={useMemo(() => ({ state, dispatch }), [state])}>
      {children}
    </TridentPoolPageContext.Provider>
  )
}

export const useTridentPoolPageContext = () => useContext(TridentPoolPageContext)
export const useTridentPoolPageState = () => useContext(TridentPoolPageContext).state
export const useTridentPoolPageDispatch = () => useContext(TridentPoolPageContext).dispatch
