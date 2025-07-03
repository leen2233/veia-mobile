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
  // console.log('Chats reducer:', action.type, state);
  switch (action.type) {
    case 'SET_CHATS':
      return {...state, data: action.payload};
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
            ? {
                ...chat,
                messages: action.payload,
                hasMore: action.hasMore,
                unread_count: action.payload.filter(
                  m => m.status !== 'read' && !m.is_mine,
                ).length,
              }
            : chat,
        ),
      };
    case 'SET_CHAT_MESSAGES_IF_NOT_EXISTS':
      // Only set messages if they don't already exist in the chat
      return {
        data: state.data.map(chat => {
          if (chat.id === action.chatId) {
            const existingMessages = chat.messages || [];
            const newMessages = action.payload.filter(
              message =>
                !existingMessages.some(
                  existingMessage => existingMessage.id === message.id,
                ),
            );
            return {
              ...chat,
              messages: [...existingMessages, ...newMessages].sort(
                (a, b) => a.time - b.time,
              ),
              hasMore: action.hasMore,
              unread_count: action.payload.filter(
                m => m.status !== 'read' && !m.is_mine,
              ).length,
            };
          }
          return chat;
        }),
      };
    case 'ADD_MESSAGE_TO_CHAT':
      const chatExists = state.data.some(
        chat => chat.id === action.payload.chat_id,
      );

      let message = {
        ...action.payload,
        // is_mine: action.payload.sender === action.userId,
      };
      console.log(message, action);

      if (chatExists) {
        return {
          data: state.data.map(chat =>
            chat.id === action.payload.chat_id
              ? {
                  ...chat,
                  messages: [...(chat.messages || []), message],
                  unread_count:
                    (chat.unread_count || 0) +
                    (message.status !== 'read' && !message.is_mine ? 1 : 0),
                }
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
        data: state.data.map(chat =>
          chat.id === action.chatId
            ? {
                ...chat,
                messages: chat.messages
                  ? chat.messages.filter(
                      message => message.id !== action.messageId,
                    )
                  : [],
              }
            : chat,
        ),
      };
    case 'EDIT_MESSAGE':
      return {
        data: state.data.map(chat =>
          chat.id === action.chatId
            ? {
                ...chat,
                messages: chat.messages
                  ? chat.messages.map(message =>
                      message.id === action.messageId
                        ? {...message, text: action.text}
                        : message,
                    )
                  : [],
              }
            : chat,
        ),
      };
    case 'READ_MESSAGE':
      return {
        data: state.data.map(chat =>
          chat.id === action.chatId
            ? {
                ...chat,
                messages: chat.messages
                  ? chat.messages.map(message =>
                      action.messageIds.includes(message.id)
                        ? {...message, status: 'read'}
                        : message,
                    )
                  : [],
                unread_count: chat.unread_count
                  ? chat.unread_count -
                    chat.messages.filter(
                      m =>
                        action.messageIds.includes(m.id) &&
                        m.status !== 'read' &&
                        !m.is_mine,
                    ).length
                  : 0,
              }
            : chat,
        ),
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
