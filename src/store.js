import {createStore, applyMiddleware} from 'redux'
import thunkMiddleware from 'redux-thunk'
import {composeWithDevTools} from 'redux-devtools-extension'
import rootReducer from './reducer'
import {delayActionMiddleware, print1, print2, print3} from './exampleAddons/middleware'

const composeEnhancer = composeWithDevTools(
    applyMiddleware(thunkMiddleware)
)

const store = createStore(rootReducer, composeEnhancer)

export default store