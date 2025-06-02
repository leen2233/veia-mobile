import {createStore, combineReducers} from 'redux';
import {isConnectingReducer} from './reducers';

const rootReducer = combineReducers({
  isConnecting: isConnectingReducer,
});

const store = createStore(rootReducer);
export default store;
