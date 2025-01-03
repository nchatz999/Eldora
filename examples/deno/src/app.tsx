import { App, Update, View } from '@nchatz999/eldora';
import { TodoInput } from './components/TodoInput.tsx';
import { TodoList } from './components/TodoList.tsx';
import { TodoStats } from './components/TodoStats.tsx';
import { todoAppStyles } from './styles.ts';

import { TodoHeader } from './components/TodoHeader.tsx';

export interface TodoItemData {
    id: number;
    text: string;
    completed: boolean;
}

export interface TodoModel {
    todos: TodoItemData[];
    newTodoText: string;
}

export interface AddTodo {
    kind: 'AddTodo';
    payload: string;
}

export interface ToggleTodo {
    kind: 'ToggleTodo';
    payload: number;
}
export interface DeleteTodo {
    kind: 'DeleteTodo';
    payload: number;
}

export interface UpdateInput {
    kind: 'UpdateInput';
    payload: string;
}
export type Msg = AddTodo | ToggleTodo | DeleteTodo | UpdateInput;

const init = (): TodoModel => ({
    todos: [],
    newTodoText: '',
});
const update: Update<TodoModel, Msg> = (model, msg) => {
    switch (msg.kind) {
        case 'AddTodo': {
            if (!model.newTodoText.trim()) return model;
            model.todos.push({
                id: Date.now(),
                text: model.newTodoText,
                completed: false,
            });
            model.newTodoText = '';
            return model;
        }
        case 'ToggleTodo': {
            const todo = model.todos.find((todo) => todo.id === msg.payload);
            if (todo) {
                todo.completed = !todo.completed;
            }
            return model;
        }
        case 'DeleteTodo': {
            model.todos = model.todos.filter((todo) => todo.id !== msg.payload);
            return model;
        }
        case 'UpdateInput': {
            model.newTodoText = msg.payload;
            return model;
        }
        default:
            return model;
    }
};

const view: View<TodoModel> = (model) => {
    return (
        <div style={todoAppStyles}>
            <TodoHeader />
            <TodoInput
                value={model.newTodoText}
            />
            <TodoList todos={model.todos} />
            <TodoStats
                todos={model.todos}
            />
        </div>
    );
};

export const app = new App(
    init,
    view,
    update,
);
