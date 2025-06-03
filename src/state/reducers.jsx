const isConnecting = {state: true};

export const isConnectingReducer = (state = isConnecting, action) => {
  switch (action.type) {
    case 'SET_IS_CONNECTING':
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};
