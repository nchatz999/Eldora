import { app, TodoItemData } from '../app.tsx';
import { deleteButtonStyles, todoItemStyles } from '../styles.ts';

interface TodoItemProps {
    todo: TodoItemData;
}

export const TodoItem = ({ todo }: TodoItemProps) => {
    return (
        <li style={todoItemStyles}>
            <input
                type='checkbox'
                checked={todo.completed}
                onChange={() => (
                    app.dispatch({
                        kind: 'ToggleTodo',
                        payload: todo.id,
                    })
                )}
            />
            <span>{todo.text}</span>
            <button
                style={deleteButtonStyles}
                onClick={() => {
                    app.dispatch({
                        kind: 'DeleteTodo',
                        payload: todo.id,
                    });
                }}
            >
                Delete
            </button>
        </li>
    );
};
