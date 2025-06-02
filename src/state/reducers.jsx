const isConnecting = {state: true};

export const isConnectingReducer = (state = isConnecting, action) => {
  console.log(action.type);
  switch (action.type) {
    case 'SET_IS_CONNECTING':
      console.log({
        ...state,
        ...action.payload,
      });
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};
