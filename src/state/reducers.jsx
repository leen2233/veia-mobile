const connectionStatus = {state: true, isAuthenticated: false};
const chats = {data: []};
const user = {};

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
      const chatExists = state.data.some(chat => chat.id === action.chat.id);

      if (chatExists) {
        return {
          data: state.data.map(chat =>
            chat.id === action.chat.id
              ? {...chat, messages: [...(chat.messages || []), action.payload]}
              : chat,
          ),
        };
      } else {
        const newChat = {
          ...action.chat,
          messages: [action.payload],
        };
        return {
          data: [newChat, ...state.data],
        };
      }
    case 'DELETE_MESSAGE':
      return {
        data: state.data.map(chat => ({
          ...chat,
          messages: chat.messages
            ? chat.messages.filter(message => message.id !== action.messageId)
            : [],
        })),
      };
    case 'EDIT_MESSAGE':
      return {
        data: state.data.map(chat => ({
          ...chat,
          messages: chat.messages
            ? chat.messages.map(message =>
                message.id === action.messageId
                  ? {...message, text: action.text}
                  : message,
              )
            : [],
        })),
      };
    case 'STATUS_CHANGE':
      return {
        data: state.data.map(chat => ({
          ...chat,
          user:
            chat.user.id === action.userId
              ? {
                  ...chat.user,
                  is_online: action.status === 'online',
                  last_seen: action.last_seen,
                }
              : chat.user,
        })),
      };
    default:
      return {data: state.data};
  }
};

export const userReducer = (state = user, action) => {
  switch (action.type) {
    case 'SET_USER':
      return action.payload;
    default:
      return state;
  }
};

export const settingsReducer = (state = {}, action) => {
  switch (action.type) {
    case 'SET_SETTINGS':
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};
