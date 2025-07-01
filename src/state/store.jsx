import {createStore, combineReducers, applyMiddleware} from 'redux';

import {
  chatsReducer,
  connectionStatusReducer,
  settingsReducer,
  userReducer,
} from './reducers';
import {thunk} from 'redux-thunk';

const rootReducer = combineReducers({
  connectionStatus: connectionStatusReducer,
  chats: chatsReducer,
  user: userReducer,
  settings: settingsReducer,
});

export const store = createStore(rootReducer, applyMiddleware(thunk));
