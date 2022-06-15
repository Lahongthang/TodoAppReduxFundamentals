import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {createSelector} from '@reduxjs/toolkit'
import { client } from "../../api/client";
import { StatusFilters } from "../filters/filtersSlice";

//init state
const initialState = {
    status: 'idle',
    entities: {}
}

export const fetchTodos = createAsyncThunk('todos/fetchTodos', async () => {
    const response = await client.get('/fakeApi/todos')
    return response.todos
})

export const saveNewTodo = createAsyncThunk('todos/saveNewTodo', async text => {
    const initialTodo = {text}
    const response = await client.post('/fakeApi/todos', {todo: initialTodo})
    return response.todo
})

//create slice
const todoSlice = createSlice({
    name: 'todos',
    initialState,
    reducers: {
        todoAdded(state, action) {
            const todo = action.payload
            state.entities[todo.id] = todo
        },
        todoToggled(state, action) {
            const todoId = action.payload
            const todo = state.entities[todoId]
            todo.completed = !todo.completed
        },
        todoColorSelected: {
            reducer(state, action) {
                const {color, todoId} = action.payload
                state.entities[todoId].color = color
            },
            prepare(todoId, color) {
                return {
                    payload: {todoId, color}
                }
            }
        },
        todoDeleted(state, action) {
            delete state.entities[action.payload]
        },
        allTodosCompleted(state) {
            Object.values(state.entities).forEach(todo => {
                state.entities[todo.id].completed = true
            })
        },
        completedTodosCleared(state) {
            Object.values(state.entities).forEach(todo => {
                if (todo.completed) {
                    delete state.entities[todo.id]
                }
            })
        }
    },
    extraReducers: builder => {
        builder
            .addCase(fetchTodos.pending, (state) => {
                state.status = 'loading'
            })
            .addCase(fetchTodos.fulfilled, (state, action) => {
                state.status = 'idle'
                action.payload.forEach(todo => {
                    state.entities[todo.id] = todo
                })
            })
            .addCase(saveNewTodo.fulfilled, (state, action) => {
                const todo = action.payload
                state.entities[todo.id] = todo
            })
    }
})

export const {
    todoAdded,
    todoToggled,
    todoColorSelected,
    todoDeleted,
    allTodosCompleted,
    completedTodosCleared,
} = todoSlice.actions

export default todoSlice.reducer


//thunk without redux-toolkit
// export const fetchTodos = () => async dispatch => {
//     dispatch(todosLoading())
//     const response = await client.get('/fakeApi/todos')
//     dispatch(todosLoaded(response.todos))
// }

// export const saveNewTodo = text => async (dispatch, getState) => {
//     const initialTodo = {text}
//     const response = await client.post('/fakeApi/todos', {todo: initialTodo})
//     dispatch(todoAdded(response.todo))
// }


//selectors
export const selectTodoEntities = state => state.todos.entities

export const selectTodos = createSelector(
    selectTodoEntities,
    entities => Object.values(entities)
)

export const selectTodoById = (state, todoId) => {
    return selectTodoEntities(state)[todoId]
}

export const selectTodoIds = createSelector(
    selectTodos,
    todos => todos.map(todo => todo.id)
)

export const selectFilteredTodos = createSelector(
    selectTodos,
    state => state.filters,
    (todos, filters) => {
        const {status, colors} = filters
        const showAllCompletions = status === StatusFilters.All     //false
        if (showAllCompletions && colors.length === 0) {
            return todos
        }

        const completedStatus = status === StatusFilters.Completed  //true
        return todos.filter(todo => {
            const statusMatches = showAllCompletions || todo.completed === completedStatus
            // console.log('statusMatches: ', statusMatches);
            const colorMatches = colors.length === 0 || colors.includes(todo.color)
            // console.log('colorMatches: ', colorMatches);
            return statusMatches && colorMatches
        })
    }
)

export const selectFilteredTodoIds = createSelector(
    selectFilteredTodos,
    filteredTodos => filteredTodos.map(todo => todo.id)
)