import {createSlice, createAsyncThunk, createEntityAdapter} from '@reduxjs/toolkit'
import {createSelector} from '@reduxjs/toolkit'
import { client } from "../../api/client";
import { StatusFilters } from "../filters/filtersSlice";

const todosAdapter = createEntityAdapter()

//init state without createEntityAdapter
// const initialState = {
//     status: 'idle',
//     entities: {}
// }

//init state with createEntityAdapter
//{ids: [], entities: {}, status: ''}
const initialState = todosAdapter.getInitialState({
    status: 'idle'
})

//thunk using redux toolkit
// export const fetchTodos = createAsyncThunk('todos/fetchTodos', async () => {
//     const response = await client.get('/fakeApi/todos')
//     return response.todos
// })

export const fetchTodos = createAsyncThunk(
    'todos/fetchTodos',
    async (dispatch, getState) => {
        return await fetch('https://todoappreduxtoolkit-default-rtdb.firebaseio.com/todos').then(
            response => response.json()
        )
    })

export const saveNewTodo = createAsyncThunk('todos/saveNewTodo', async text => {
    const initialTodo = {text}
    const response = await client.post('/fakeApi/todos', {todo: initialTodo})
    return response.todo
})

//create slice
const todosSlice = createSlice({
    name: 'todos',
    initialState,
    reducers: {
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
        // todoDeleted(state, action) {
        //     delete state.entities[action.payload]
        // },
        todoDeleted: todosAdapter.removeOne,
        allTodosCompleted(state) {
            Object.values(state.entities).forEach(todo => {
                todo.completed = true
            })
        },
        // completedTodosCleared(state) {
        //     Object.values(state.entities).forEach(todo => {
        //         if (todo.completed) {
        //             delete state.entities[todo.id]
        //         }
        //     })
        // },
        completedTodosCleared(state) {
            const completedTodoIds = Object.values(state.entities)
                .filter(todo => todo.completed)
                .map(todo => todo.id)
            todosAdapter.removeMany(state, completedTodoIds)
        }
    },
    extraReducers: builder => {
        builder
            .addCase(fetchTodos.pending, (state) => {
                state.status = 'loading'
            })
            .addCase(fetchTodos.fulfilled, (state, action) => {
                state.status = 'idle'
                // action.payload.forEach(todo => {
                //     state.entities[todo.id] = todo
                // })
                todosAdapter.setAll(state, action.payload)
            })
            .addCase(fetchTodos.rejected, (state, action) => {
                console.log('error');
            })
            // .addCase(saveNewTodo.fulfilled, (state, action) => {
            //     const todo = action.payload
            //     state.entities[todo.id] = todo
            // })
            .addCase(saveNewTodo.fulfilled, todosAdapter.addOne)
    }
})

export const {
    todoToggled,
    todoColorSelected,
    todoDeleted,
    allTodosCompleted,
    completedTodosCleared,
} = todosSlice.actions

export default todosSlice.reducer


//selectors
export const {
    selectAll: selectTodos,
    selectById: selectTodoById
} = todosAdapter.getSelectors(state => state.todos)

export const selectTodoIds = createSelector(
    selectTodos,
    todos => todos.map(todo => todo.id)
)

export const selectFilteredTodos = createSelector(
    selectTodos,
    state => state.filters,
    (todos, filters) => {
        const {status, colors} = filters
        const showAllCompletions = status === StatusFilters.All
        if (showAllCompletions && colors.length === 0) {
            return todos
        }

        const completedStatus = status === StatusFilters.Completed
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