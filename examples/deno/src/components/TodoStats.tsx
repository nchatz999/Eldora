import { Lazy } from '@nchatz999/eldora';
import { TodoItemData } from '../app.tsx';
import { todoStatsStyles } from '../styles.ts';
interface TodoStatsProps {
    todos: TodoItemData[];
}

export const TodoStats = ({ todos }: Lazy<TodoStatsProps>) => {
    const completedCount = todos.filter((todo) => todo.completed).length;

    return (
        <div style={todoStatsStyles}>
            <p>Total todos: {todos.length}</p>
            <p>Completed: {completedCount}</p>
        </div>
    );
};
