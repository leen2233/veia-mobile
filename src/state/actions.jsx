export const setConnectionStatus = state => {
  return {
    type: 'SET_CONNECTION_STATUS',
    payload: state,
  };
};

export const setChats = state => {
  return {
    type: 'SET_CHATS',
    payload: state,
  };
};

export const addChat = state => {
  return {
    type: 'ADD_CHAT',
    payload: state,
  };
};

export const setMessages = (state, chatId, hasMore) => {
  return {
    type: 'SET_CHAT_MESSAGES',
    payload: state,
    chatId: chatId,
    hasMore: hasMore,
  };
};

export const setMessagesIfNotExists = (state, chatId, hasMore) => {
  return {
    type: 'SET_CHAT_MESSAGES_IF_NOT_EXISTS',
    payload: state,
    chatId: chatId,
    hasMore: hasMore,
  };
};

export const addMessageToChat = message => (dispatch, getState) => {
  const {user} = getState();
  const is_mine = user ? message.sender === user.id : false;

  dispatch({
    type: 'ADD_MESSAGE_TO_CHAT',
    payload: {
      ...message,
      is_mine,
    },
  });
};

export const setUser = state => {
  return {type: 'SET_USER', payload: state};
};
