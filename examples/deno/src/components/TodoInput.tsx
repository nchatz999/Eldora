import { app } from '../app.tsx';

import {
    addButtonStyles,
    todoInputContainerStyles,
    todoInputStyles,
} from '../styles.ts';

interface TodoInputProps {
    value: string;
}

export const TodoInput = ({ value }: TodoInputProps) => {
    return (
        <div style={todoInputContainerStyles}>
            <input
                type='text'
                id='input'
                value={value}
                style={todoInputStyles}
                onInput={(e) => {
                    app.dispatch({
                        kind: 'UpdateInput',
                        payload: (e.target as HTMLInputElement).value,
                    });
                }}
                placeholder='What needs to be done?'
            />
            <button
                style={addButtonStyles}
                onClick={() => {
                    app.dispatch({
                        kind: 'AddTodo',
                        payload: value,
                    });
                }}
            >
                Add Todo
            </button>
        </div>
    );
};
