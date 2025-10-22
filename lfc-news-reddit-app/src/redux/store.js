/**
 * @author Tom Butler
 * @date 2025-10-22
 * @description Redux store configuration with thunk middleware for async actions.
 *              DevTools integration enabled for development debugging.
 */

import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';

// DevTools extension support falls back to standard compose if extension unavailable
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunk))
);

export default store;