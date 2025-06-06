import {createStore, combineReducers} from 'redux';
import {chatsReducer, connectionStatusReducer} from './reducers';

const rootReducer = combineReducers({
  connectionStatus: connectionStatusReducer,
  chats: chatsReducer,
});

const store = createStore(rootReducer);
export default store;
