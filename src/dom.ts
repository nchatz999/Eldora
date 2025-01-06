/**
 * @module dom
 * @description DOM rendering and manipulation utilities
 *
 * Handles the conversion of virtual DOM nodes to actual DOM elements and manages
 * DOM updates through diffing algorithm.
 */

import {
  FunctionComponent,
  VElement,
  VFunction,
  VNode,
  VPrimitive,
} from './core.ts';
import { HTMLAttributes } from './html.ts';

/**
 * Renders a virtual DOM node into an actual DOM element
 * @param node - Virtual DOM node to render
 * @returns Rendered HTML element or text node
 */
export function render(
  node: VNode,
): HTMLElement | Text {
  switch (node.type) {
    case ('primitive'): {
      const element = document.createTextNode(String(node.value));

      return element;
    }
    case ('html'): {
      const element = document.createElement(node.value);

      const signal = node.controller.signal;
      Object.entries(node.props).forEach(([key, value]) => {
        switch (key) {
          case 'style': {
            Object.assign(element.style, value);
            break;
          }
          case 'className': {
            element.setAttribute('class', value);
            break;
          }
          case 'value': {
            (element as HTMLInputElement).value = value;
            break;
          }
          case 'checked': {
            (element as HTMLInputElement).checked = value;
            break;
          }
          default: {
            if (key.startsWith('on')) {
              const eventName = key.slice(2).toLowerCase();
              element.addEventListener(eventName, value, { signal });
              break;
            }
            element.setAttribute(key, String(value));
          }
        }
      });
      node.children.forEach((child) => {
        element.appendChild(render(child));
      });
      return element;
    }
    case ('function'): {
      const topNode = node.value(node.props);
      node.topNode = topNode;
      return render(topNode);
    }
  }
}

/**
 * Normalizes children to always be an array of VNodes
 * @param children - Children to normalize
 * @returns Normalized array of VNode children
 * @private
 */
export function normalizeChildren(
  children:
    | (VNode | string | number)[]
    | (VNode | string | number)
    | undefined,
): (VNode)[] {
  if (!children) {
    return [];
  }

  const arrayChildren = Array.isArray(children) ? children : [children];

  return arrayChildren.map((child) => {
    if (typeof child === 'string' || typeof child === 'number') {
      return {
        type: 'primitive',
        value: child,
        domElement: undefined,
        key: undefined,
      };
    }
    return child;
  });
}

/**
 * Creates a virtual DOM node (JSX element)
 * @param type - Element type (string tag name) or function component
 * @param props - Element properties including children
 * @returns Virtual DOM node
 *
 * @example
 * ```tsx
 * const element = eldoraJSX('div', { className: 'container', children: 'Hello' });
 * ```
 */
export function eldoraJSX(
  type: string | FunctionComponent,
  props: HTMLAttributes<HTMLElement> = {},
  key?: string,
): VNode {
  return parseJSXToEldoraNode(type, props, key);
}

/**
 * Parses JSX syntax into Eldora virtual DOM nodes
 * @param type - Element type or component
 * @param props - Element properties
 * @returns Virtual DOM node
 * @private
 */
function parseJSXToEldoraNode(
  type: string | FunctionComponent,
  props: HTMLAttributes<HTMLElement> = {},
  key?: string,
): VNode {
  if (typeof type === 'function') {
    return {
      type: 'function',
      value: type,
      props,
      topNode: undefined,
      key,
    };
  }

  if (typeof type === 'string') {
    const children = normalizeChildren(props.children);
    delete props.children;
    return {
      type: 'html',
      value: type,
      children,
      props,
      controller: new AbortController(),
      key,
    };
  }

  throw new Error('Invalid JSX node');
}

/**
 * Core diffing function that handles all types of virtual nodes in the virtual DOM.
 *
 * @param oldVNode - The previous virtual node
 * @param newVNode - The new virtual node to compare against
 * @param element - The DOM element or text node to update
 *
 * Handles three node types:
 * - primitive: Text nodes (strings, numbers, booleans)
 * - html: Standard HTML elements
 * - function: Component nodes
 */
export function diff(
  oldVNode: VNode,
  newVNode: VNode,
  element: HTMLElement | Text,
): void {
  switch (newVNode.type) {
    case 'primitive':
      diffPrimitive(oldVNode as VPrimitive, newVNode, element as Text);
      break;
    case 'html':
      diffElement(
        oldVNode as VElement,
        newVNode as VElement,
        element as HTMLElement,
      );
      break;
    case 'function':
      diffFunction(
        oldVNode as VFunction,
        newVNode as VFunction,
        element as HTMLElement,
      );
      break;
  }
}

/**
 * Updates a text node when its primitive value has changed.
 *
 * @param oldNode - The previous primitive node (containing string, number, or boolean)
 * @param newNode - The new primitive node to compare against
 * @param element - The Text node to update
 *
 * Behavior:
 * - Only updates if values are different
 * - Updates both virtual node and DOM text content
 * - Converts value to string for DOM update
 */
function diffPrimitive(
  oldNode: VPrimitive,
  newNode: VPrimitive,
  element: Text,
): void {
  if (oldNode.value !== newNode.value) {
    oldNode.value = newNode.value;
    element.nodeValue = String(newNode.value);
  }
}

/**
 * Diffs and updates an element node and its descendants in the virtual DOM.
 *
 * @param oldNode - The previous element node
 * @param newNode - The new element node to compare against
 * @param element - The DOM element to update
 *
 * Operations:
 * 1. Updates element properties and attributes
 * 2. Recursively updates child elements
 */
function diffElement(
  oldNode: VElement,
  newNode: VElement,
  element: HTMLElement,
): void {
  diffProps(oldNode, newNode, element);
  diffChildren(oldNode.children, newNode.children, element);
}

/**
 * Diffs and updates function components in the virtual DOM.
 *
 * @param oldNode - The previous function component node
 * @param newNode - The new function component node to compare against
 * @param element - The DOM element to update
 *
 * Behavior:
 * - For lazy components: Only updates if props have changed
 * - For regular components: Always re-renders
 * - Recursively diffs the resulting virtual nodes
 */
function diffFunction(
  oldNode: VFunction,
  newNode: VFunction,
  element: HTMLElement,
): void {
  if (oldNode.props.lazy) {
    if (JSON.stringify(oldNode.props) === JSON.stringify(newNode.props)) { // TODO: more perfomant comparison
      return;
    }
  }
  const newTopNode = newNode.value(newNode.props);
  const oldTopNode = oldNode.topNode as VElement;
  oldNode.props = newNode.props;
  diff(oldTopNode, newTopNode, element);
}

/**
 * Implements a diffing algorithm that handles element creation, deletion, updates, and reordering.
 *
 * @param oldChildren - Array of existing virtual DOM nodes that are currently rendered
 * @param newChildren - Array of new virtual DOM nodes that need to be rendered
 * @param parentDOM - The parent DOM element containing the children to be diffed
 *
 * Key features:
 * - Handles empty states (no old or new children)
 * - Supports keyed elements
 * - Maintains element order and hierarchy
 *
 * Algorithm steps:
 * 1. Handle empty cases (new children or removed children)
 * 2. Create key maps for tracking element positions
 * 3. Remove old children that don't exist in new set
 * 4. Process differences (updates, additions, removals)
 * 5. Clean up any remaining removed children
 */
function diffChildren(
  oldChildren: VNode[],
  newChildren: VNode[],
  parentDOM: HTMLElement,
): void {
  if (oldChildren.length === 0) {
    newChildren.forEach((child) => {
      const newNode = render(child);
      oldChildren.push(child);
      parentDOM.appendChild(newNode);
    });
    return;
  }

  if (newChildren.length === 0) {
    parentDOM.textContent = '';
    oldChildren.length = 0;
    return;
  }

  const oldKeyMap = new Map<string, number>();
  const newKeyMap = new Map<string, number>();
  oldChildren.forEach((child, i) => child.key && oldKeyMap.set(child.key, i));
  newChildren.forEach((child, i) => child.key && newKeyMap.set(child.key, i));

  for (let i = 0; i < oldChildren.length;) {
    const child = oldChildren[i];
    if (child.key) {
      if (!newKeyMap.has(child.key)) {
        parentDOM.removeChild(parentDOM.childNodes[i]);
        oldChildren.splice(i, 1);
        continue;
      }
      oldKeyMap.set(child.key, i);
    }
    i++;
  }

  let removedCount = 0;

  for (let i = 0; i < Math.max(oldChildren.length, newChildren.length); i++) {
    const newChild = newChildren[i];
    const oldChild = oldChildren[i];

    if (!newChild) {
      removedCount += 1;
      continue;
    }

    if (!oldChild) {
      const newElement = render(newChild);
      parentDOM.appendChild(newElement);
      oldChildren.push(newChild);
      continue;
    }

    if (newChild.key && oldKeyMap.has(newChild.key)) {
      const oldKeyedItem = oldKeyMap.get(newChild.key)!;
      if (oldKeyedItem !== i) {
        if (oldChild.key) {
          oldKeyMap.set(oldChild.key, oldKeyedItem);
        }
        domChildSwap(parentDOM, i, oldKeyedItem);

        [oldChildren[i], oldChildren[oldKeyedItem]] = [
          oldChildren[oldKeyedItem],
          oldChildren[i],
        ];

        diff(
          oldChildren[i],
          newChildren[i],
          parentDOM.childNodes[i] as HTMLElement | Text,
        );
        continue;
      }
    }
    const needsReplacement = oldChild.type !== newChild.type ||
      (oldChild.type === 'html' && oldChild.value !== newChild.value) ||
      (oldChild.type === 'function' && oldChild.value !== newChild.value);

    if (oldChild.key) {
      oldKeyMap.delete(oldChild.key);
    }

    if (needsReplacement) {
      const newElement = render(newChild);
      parentDOM.replaceChild(newElement, parentDOM.childNodes[i]);

      oldChildren[i] = newChild;
      continue;
    }
    diff(
      oldChild,
      newChild,
      parentDOM.childNodes[i] as HTMLElement | Text,
    );
  }

  for (let i = 0; i < removedCount; i++) {
    parentDOM.removeChild(parentDOM.lastChild!);
    oldChildren.pop();
  }
}

/**
 * Updates the properties and attributes of a DOM element based on changes between old and new virtual nodes.
 *
 * @param oldNode - The previous virtual element node
 * @param newNode - The new virtual element node to apply
 * @param element - The actual DOM element to update
 *
 * Handles updates for:
 * - Event listeners (with automatic cleanup via AbortController)
 * - Class names
 * - Style objects
 * - Form element states (checked, value)
 * - Standard HTML attributes
 */
function diffProps(
  oldNode: VElement,
  newNode: VElement,
  element: HTMLElement,
): void {
  const keys = new Set(
    Object.keys(oldNode.props).concat(Object.keys(newNode.props)),
  );
  oldNode.controller.abort();
  oldNode.controller = new AbortController();

  keys.forEach((key) => {
    const oldValue = oldNode.props[key];
    const newValue = newNode.props[key];

    if (key.startsWith('on')) {
      if (newValue) {
        element.addEventListener(
          key.slice(2).toLowerCase(),
          newValue,
          { signal: oldNode.controller.signal },
        );
      }
      return;
    }
    if (key === 'className') {
      if (oldValue !== newValue) {
        element.setAttribute('class', newValue);
      }
      return;
    }
    if (key === 'style') {
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        Object.assign(element.style, newValue);
      }
      return;
    }

    if (oldValue !== newValue) {
      if (key === 'checked') {
        (element as HTMLInputElement).checked = newValue;
        return;
      }
      if (key === 'value') {
        (element as HTMLInputElement).value = newValue;
        return;
      }
      element.setAttribute(key, newValue);
    }
  });
  oldNode.props = newNode.props;
}

/**
 * Swaps the positions of two child elements within a parent DOM element.
 *
 * @param parent - The parent DOM element containing the children to swap
 * @param destination - The index of the first child element
 * @param from - The index of the second child element
 */
function domChildSwap(
  parent: HTMLElement,
  destination: number,
  from: number,
) {
  const fromElement = parent.childNodes[from];
  const destinationElement = parent.childNodes[destination];

  const fromNext = fromElement.nextSibling;
  const destNext = destinationElement.nextSibling;

  if (fromNext === destinationElement) {
    parent.insertBefore(destinationElement, fromElement);
  } else if (destNext === fromElement) {
    parent.insertBefore(fromElement, destinationElement);
  } else {
    parent.insertBefore(fromElement, destNext);
    parent.insertBefore(destinationElement, fromNext);
  }
}
