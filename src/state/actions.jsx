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

export const setMessages = (state, chatId) => {
  return {
    type: 'SET_CHAT_MESSAGES',
    payload: state,
    chatId: chatId,
  };
};

export const addMessageToChat = (state, messageChat) => {
  console.log(messageChat, 'chattttttttttttttt');
  return {
    type: 'ADD_MESSAGE_TO_CHAT',
    payload: state,
    chat: messageChat,
  };
};

export const setUser = state => {
  return {type: 'SET_USER', payload: state};
};
