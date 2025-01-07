/**
 * @module core
 * @description Core functionality and types for Eldora framework
 *
 * Provides the foundation for the virtual DOM implementation and component system.
 * Includes types for nodes, components, and refs.
 */
import { diff, render } from './dom.ts';

/**
 * Represents a virtual DOM element node (HTML element)
 * @interface VElement
 */
export type VElement = {
  type: 'html';
  value: string;
  props: Record<string, any>;
  children: VNode[];
  key: string | undefined;
};

/**
 * Represents a virtual DOM function component node
 * @interface VFunction
 */
export type VFunction = {
  type: 'function';
  value: FunctionComponent;
  props: Record<string, any>;
  topNode: VElement | undefined;
  key: string | undefined;
};

/**
 * Represents a virtual DOM primitive node (text content)
 * @interface VPrimitive
 */
export type VPrimitive = {
  type: 'primitive';
  value: number | string;
  key: string | undefined;
};

/**
 * Union type representing any virtual DOM node
 * Can be an element, function component, or primitive
 */
export type VNode = VElement | VPrimitive | VFunction;

/**
 * Represents a functional component
 * @param props - Component properties
 * @returns Virtual DOM node
 */
export type FunctionComponent = (
  props: Record<string, unknown>,
) => VElement;

/**
 * Main application class that handles state management and view rendering
 * @template M - Model/State type
 * @template Msg - Message/Action type
 */
export class App<M, Msg> {
  private model: M;
  private view: (model: M) => VNode;
  private update: (model: M, msg: Msg) => M;
  private container: HTMLElement;
  private previous: VNode | undefined;
  private previousElement: HTMLElement | undefined;
  private focusedElementId: string | null;

  /**
   * Creates a new Eldora application
   * @param init - Initial state factory function
   * @param view - View function that renders the UI based on state
   * @param update - Update function that handles state transitions
   */
  constructor(
    init: () => M,
    view: (model: M) => VNode,
    update: (model: M, msg: Msg) => M,
  ) {
    this.model = init();
    this.view = view;
    this.update = update;
    this.container = document.createElement('div');
    this.focusedElementId = null;
  }

  /**
   * Attaches the app to a DOM container
   * @param container - DOM element to mount the app
   */
  public attach(container: HTMLElement) {
    this.container = container;
    this.renderView();
  }

  /**
   * Dispatches a message to update application state
   * @param msg - Message to dispatch
   */
  public dispatch = (msg: Msg): void => {
    if (document.activeElement !== null) {
      this.focusedElementId = document.activeElement.id;
    }

    this.model = this.update(this.model, msg);

    this.renderView();
  };

  /**
   * Renders the current view state
   * @private
   */
  private renderView(): void {
    const currentNode = this.view(this.model);

    if (!this.previous || !this.previousElement) {
      this.previous = currentNode;
      this.previousElement = render(this.previous) as HTMLElement;
      this.container.replaceChildren(this.previousElement);
      return;
    }
    diff(this.previous, currentNode, this.previousElement);
    if (this.focusedElementId) {
      const element = document.getElementById(this.focusedElementId);
      if (element) {
        element.focus();
      }
    }
  }
}

/**
 * Update function type for state transitions
 */
export type Update<M, Msg> = (model: M, msg: Msg) => M;

/**
 * View function type for rendering UI
 */
export type View<M> = (model: M) => VNode;

/**
 * Program configuration type
 */
export type Program<M, Msg> = {
  init: () => M;
  update: Update<M, Msg>;
  view: View<M>;
};

/**
 * Reference object for accessing DOM elements
 */
export interface RefObject<T> {
  current: T | null;
  onMount: ((arg: T) => void) | null;
}

/**
 * Creates a ref object for accessing DOM elements
 * @param initialValue - Initial value for the ref
 * @param onMount - Callback called when element is mounted
 * @returns Reference object
 *
 * @example
 * ```tsx
 * const inputRef = useRef<HTMLInputElement>(null, (el) => el.focus());
 * ```
 */
export function useRef<T>(
  initialValue: T | null = null,
  onMount: (arg: T) => void,
): RefObject<T> {
  return {
    current: initialValue,
    onMount,
  };
}

/**
 * Represents a node that can be cached
 * @template P - Props type for the lazy component
 *
 * The Lazy type adds an optional 'lazy' flag to component props to indicate
 * that the component should be cached based on its props. When marked as lazy,
 * the framework will attempt to reuse the component's previous render result
 * if its props haven't changed, avoiding unnecessary re-renders and improving performance.
 */
export type Lazy<P = unknown> = P & {
  lazy?: true;
};
