import {createStore, combineReducers} from 'redux';
import {chatsReducer, connectionStatusReducer, userReducer} from './reducers';

const rootReducer = combineReducers({
  connectionStatus: connectionStatusReducer,
  chats: chatsReducer,
  user: userReducer,
});

const store = createStore(rootReducer);
export default store;
