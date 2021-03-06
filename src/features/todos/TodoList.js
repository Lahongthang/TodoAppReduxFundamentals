import {useSelector, shallowEqual} from 'react-redux'
import { selectFilteredTodoIds } from './todosSlice';
import TodoListItem from "./TodoListItem";

const TodoList = () => {
    // const st = useSelector(state => state)
    // console.log('todos: ', st);

    const todoIds = useSelector(selectFilteredTodoIds, shallowEqual)
    const loadingStatus = useSelector(state => state.todos.status)

    if (loadingStatus === 'loading') {
        return (
            <div className='todo-list'>
                <div className='loader'></div>
            </div>
        )
    }

    const renderedListItems = todoIds.map(todoId => {
        return <TodoListItem key={todoId} id={todoId}/>
    })

    return <ul className="todo-list">{renderedListItems}</ul>
}

export default TodoList