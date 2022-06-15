import {configureStore} from '@reduxjs/toolkit'
import todosReducer from './features/todos/todosSlice'
import filtersReducer from './features/filters/filtersSlice'

const store = configureStore({
    reducer: {
        todos: todosReducer,
        filters: filtersReducer
    }
})

export default store

// import {createStore} from 'redux'
// import { composeWithDevTools } from 'redux-devtools-extension'
// import { applyMiddleware } from 'redux'
// import thunkMiddleware from 'redux-thunk'
// import rootReducer from './reducer'

// const composeEnhancer = composeWithDevTools(
//     applyMiddleware(thunkMiddleware)
// )

// const store = createStore(rootReducer, composeEnhancer)

// export default store