import { todoListStyles } from '../styles.ts';
import { TodoItem } from './TodoItem.tsx';
import { TodoItemData } from '../app.tsx';

interface TodoListProps {
    todos: TodoItemData[];
}

export const TodoList = ({ todos }: TodoListProps) => {
    return (
        <ul style={todoListStyles}>
            {todos.map((todo) => <TodoItem todo={todo} />)}
        </ul>
    );
};
