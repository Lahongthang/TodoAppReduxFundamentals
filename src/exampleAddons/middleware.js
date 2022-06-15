import {client} from '../api/client'

export const print1 = (storeAPI) => (next) => (action) => {
  console.log('1')
  return next(action)
}

export const print2 = (storeAPI) => (next) => (action) => {
  console.log('2')
  return next(action)
}

export const print3 = (storeAPI) => (next) => (action) => {
  console.log('3')
  return next(action)
}

export const loggerMiddleware = storeAPI => next => action => {
  console.log('dispatching', action)
  let result = next(action)
  console.log('next state', storeAPI.getState())
  return result
}

export const alwaysReturnHelloMiddleware = storeAPI => next => action => {
  const originalResult = next(action)
  return 'Hello!'
}

export const delayMessageMiddleware = storeAPI => next => action => {
  if (action.type === 'todos/todoAdded') {
    setTimeout(() => {
      console.log('Add a new todo: ', action.payload);
    }, 2000)
  }
  console.log('abc');

  return next(action)
}

export const delayActionMiddleware = storeAPI => next => action => {
  if (action.type === 'todos/todoToggled') {
    setTimeout(() => {
      next(action)
    }, 2000)
    return 
  }
  return next(action)
}

export const fetchTodosMiddleware = storeAPI => next => action => {
  if (action.type === 'todos/fetchTodos') {
    client.get('todos').then(todos => {
      storeAPI.dispatch({type: 'todos/todosLoaded', payload: todos})
    })
  }
  return next(action)
}