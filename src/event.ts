/**
 * @module event
 * @description A centralized event management system for handling DOM events.
 * This module provides a singleton-based approach to manage event listeners
 * across an application, implementing event delegation pattern for better
 * performance and memory management.
 *
 * Features:
 * - Event delegation to reduce number of actual DOM event listeners
 * - Type-safe event listener registration and removal
 * - Support for multiple listeners per element/event combination
 *
 * @example
 * ```typescript
 * import { eventManager } from './EventManager';
 *
 * const button = document.querySelector('button');
 * const handleClick = (event: Event) => console.log('Button clicked!');
 *
 * // Add event listener
 * eventManager.addEventListener(button, 'click', handleClick);
 *
 * // Remove event listener
 * eventManager.removeEventListener(button, 'click', handleClick);
 * ```
 */

/**
 * Interface for event listener functions
 */
interface Listener {
    (event: Event): void;
}

/**
 * List of supported DOM event types
 */
const eventTypes = [
    'click',
    'change',
    'input',
    'submit',
    'keydown',
    'keyup',
    'mousedown',
    'mouseup',
    'mousemove',
    'focus',
    'blur',
];

/**
 * EventManager class - Manages DOM event listeners using a singleton pattern
 * Provides centralized event handling and delegation
 */
export class EventManager {
    private static instance: EventManager | null = null;
    private context: Document | Window;
    private listeners: Map<string, Map<HTMLElement, Listener[]>>;

    /**
     * Private constructor to enforce singleton pattern.
     * @param context - The DOM context (Document or Window) to attach event listeners to
     */
    private constructor(context: Document | Window = document) {
        this.context = context;
        this.listeners = new Map();
        this.addTopLevelEventListener();
    }
    /**
     * Gets the singleton instance of EventManager.
     * @param context - The DOM context to use (defaults to document)
     * @returns The EventManager instance
     */
    static getInstance(context: Document | Window = document): EventManager {
        if (!this.instance) {
            this.instance = new EventManager(context);
        }
        return this.instance;
    }
    /**
     * Adds a top-level event listener to the context
     * @private
     */
    private addTopLevelEventListener(): void {
        eventTypes.forEach((eventType) => {
            this.context.addEventListener(
                eventType,
                this.handleEvent.bind(this),
            );
        });
    }

    /**
     * Handles the event and dispatches it to the corresponding listener
     * @param {Event} event - The event to handle
     * @private
     */
    private handleEvent(event: Event): void {
        const { type, target } = event;

        const listenersForType = this.getListenersForType(type as string);
        if (listenersForType) {
            const listenersForTarget = listenersForType.get(
                target as HTMLElement,
            );
            if (listenersForTarget) {
                listenersForTarget.forEach((listener) => listener(event));
            }
        }
    }

    /**
     * Adds an event listener for the given element and event type
     * @param {HTMLElement} element - The element to add the event listener to
     * @param {String} type - The event type (e.g. click, change, input)
     * @param {Listener} listener - The event listener to add
     */
    public addEventListener(
        element: HTMLElement,
        type: string,
        listener: Listener,
    ): void {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, new Map());
        }
        const listenersForType = this.listeners.get(type);
        if (!listenersForType) return;
        if (!listenersForType.has(element)) {
            listenersForType.set(element, []);
        }
        const listenersForElement = listenersForType.get(element);
        if (listenersForElement) {
            listenersForElement.push(listener);
        }
    }

    /**
     * Removes an event listener for the given element and event type
     * @param {HTMLElement} element - The element to remove the event listener from
     * @param {String} type - The event type (e.g. click, change, input)
     * @param {Listener} listener - The event listener to remove
     */
    public removeEventListener(
        element: HTMLElement,
        type: string,
        listener: Listener,
    ): void {
        if (this.listeners.has(type)) {
            const listenersForType = this.listeners.get(type);
            if (listenersForType && listenersForType.has(element)) {
                const listenersForElement = listenersForType.get(element);
                if (listenersForElement) {
                    const index = listenersForElement.indexOf(listener);
                    if (index !== -1) {
                        listenersForElement.splice(index, 1);
                    }
                }
            }
        }
    }

    /**
     * Removes all event listeners for the given element
     * @param {HTMLElement} element - The element to remove all event listeners from
     */
    public removeAllEventListenersForElement(element: HTMLElement): void {
        for (const listenersForType of this.listeners.values()) {
            listenersForType.delete(element);
        }
    }

    /**
     * Gets the listeners for the given event type
     * @param {String} type - The event type (e.g. click, change, input)
     * @returns {Map<HTMLElement, Listener[]>} The listeners for the given event type
     * @private
     */
    private getListenersForType(
        type: string,
    ): Map<HTMLElement, Listener[]> | undefined {
        return this.listeners.get(type);
    }
}

export const eventManager = EventManager.getInstance();
