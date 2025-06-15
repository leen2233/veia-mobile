import {createStore, combineReducers} from 'redux';
import {
  chatsReducer,
  connectionStatusReducer,
  settingsReducer,
  userReducer,
} from './reducers';

const rootReducer = combineReducers({
  connectionStatus: connectionStatusReducer,
  chats: chatsReducer,
  user: userReducer,
  settings: settingsReducer,
});

const store = createStore(rootReducer);
export default store;
