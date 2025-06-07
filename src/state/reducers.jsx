const connectionStatus = {state: true, isAuthenticated: false};
const chats = [];

export const connectionStatusReducer = (state = connectionStatus, action) => {
  switch (action.type) {
    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

export const chatsReducer = (state = chats, action) => {
  switch (action.type) {
    case 'SET_CHATS':
      return {data: action.payload};
    case 'ADD_CHAT':
      return {
        data: state.data.some(chat => chat.id === action.payload.id)
          ? state.data
          : [...state.data, action.payload],
      };
    case 'SET_CHAT_MESSAGES':
      return {
        data: state.data.map(chat =>
          chat.id === action.chatId
            ? {...chat, messages: action.payload}
            : chat,
        ),
      };
    case 'ADD_MESSAGE_TO_CHAT':
      return {
        data: state.data.map(chat =>
          chat.id === action.chatId
            ? {...chat, messages: [...chat.messages, action.payload]}
            : chat,
        ),
      };
    default:
      return {data: state};
  }
};
