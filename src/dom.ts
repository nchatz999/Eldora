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
      node.domElement = element;
      return element;
    }
    case ('html'): {
      const element = document.createElement(node.value);

      node.domElement = element;
      const signal = node.controller.signal;
      Object.entries(node.props).forEach(([key, value]) => {
        switch (key) {
          case 'style': {
            Object.assign(node.domElement!.style, value);
            break;
          }
          case 'className': {
            node.domElement!.setAttribute('class', value);
            break;
          }
          case 'value': {
            (node.domElement! as HTMLInputElement).value = value;
            break;
          }
          case 'checked': {
            (node.domElement! as HTMLInputElement).checked = value;
            break;
          }
          default: {
            if (key.startsWith('on')) {
              const eventName = key.slice(2).toLowerCase();
              node.domElement!.addEventListener(eventName, value, { signal });
              break;
            }
            node.domElement!.setAttribute(key, String(value));
          }
        }
      });
      node.children.forEach((child) => {
        node.domElement?.appendChild(render(child));
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
const normalizeChildren = (
  children:
    | (VNode | string | number)[]
    | (VNode | string | number)
    | undefined,
): (VNode)[] => {
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
      };
    }
    return child;
  });
};

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
): VNode {
  return parseJSXToEldoraNode(type, props);
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
): VNode {
  if (typeof type === 'function') {
    return {
      type: 'function',
      value: type,
      props,
      topNode: undefined,
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
      domElement: undefined,
    };
  }

  throw new Error('Invalid JSX node');
}

export function diff(
  oldVNode: VNode,
  newVNode: VNode,
): void {
  switch (newVNode.type) {
    case 'primitive':
      diffPrimitive(oldVNode as VPrimitive, newVNode);
      break;
    case 'html':
      diffElement(oldVNode as VElement, newVNode as VElement);
      break;
    case 'function':
      diffFunction(oldVNode as VFunction, newVNode as VFunction);
      break;
  }
}

/**
 * Diffs primitive nodes (text)
 */
function diffPrimitive(
  oldNode: VPrimitive,
  newNode: VPrimitive,
): void {
  if (oldNode.value !== newNode.value) {
    oldNode.value = newNode.value;
    oldNode.domElement!.nodeValue = String(newNode.value);
  }
}

/**
 * Diffs element nodes
 */
function diffElement(
  oldNode: VElement,
  newNode: VElement,
): void {
  diffProps(oldNode, newNode);

  diffChildren(oldNode.children, newNode.children, oldNode.domElement!);
}

/**
 * Diffs function components
 */
function diffFunction(
  oldNode: VFunction,
  newNode: VFunction,
): void {
  if (oldNode.props.lazy) {
    if (JSON.stringify(oldNode.props) === JSON.stringify(newNode.props)) {
      return;
    }
  }
  const newTopNode = newNode.value(newNode.props);
  const oldTopNode = oldNode.topNode as VElement;
  oldNode.props = newNode.props;
  diff(oldTopNode, newTopNode);
}

/**
 * Diffs and updates children arrays
 */
function diffChildren(
  oldChildren: VNode[],
  newChildren: VNode[],
  parentDOM: HTMLElement,
): void {
  const oldLength = oldChildren.length;
  const newLength = newChildren.length;
  let removedCount = 0;

  const maxLength = Math.max(oldLength, newLength);

  if (maxLength === 0) return;
  if (oldLength === 0) {
    newChildren.forEach((child) => {
      const newNode = render(child);
      oldChildren.push(child);
      parentDOM.appendChild(newNode);
    });
    return;
  }
  if (newLength === 0) {
    oldChildren.forEach((child) => {
      removeVNode(child);
    });
    oldChildren.length = 0;
    return;
  }
  for (let i = 0; i < maxLength; i++) {
    const oldChild = oldChildren[i];
    const newChild = newChildren[i];

    if (!newChild) {
      removeVNode(oldChild);
      removedCount++;
      continue;
    }

    if (!oldChild) {
      const newNode = render(newChild);
      parentDOM.appendChild(newNode);
      oldChildren[i] = newChild;
      continue;
    }

    if (oldChild === newChild) continue;

    const needsReplacement = oldChild.type !== newChild.type ||
      (oldChild.type === 'html' && oldChild.value !== newChild.value) ||
      (oldChild.type === 'function' && oldChild.value !== newChild.value);

    if (needsReplacement) {
      replaceVNode(oldChild, newChild);
      oldChildren[i] = newChild;
      continue;
    }

    diff(oldChild, newChild);
  }

  for (let i = 0; i < removedCount; i++) {
    oldChildren.pop();
  }
}

/**
 * Diffs element props
 */
function diffProps(
  oldNode: VElement,
  newNode: VElement,
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
        oldNode.domElement?.addEventListener(
          key.slice(2).toLowerCase(),
          newValue,
          { signal: oldNode.controller.signal },
        );
      }
      return;
    }
    if (key === 'className') {
      if (oldValue !== newValue) {
        oldNode.domElement?.setAttribute('class', newValue);
      }
      return;
    }
    if (key === 'style') {
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        Object.assign(oldNode.domElement!.style, newValue);
      }
      return;
    }

    if (oldValue !== newValue) {
      if (key === 'checked') {
        (oldNode.domElement as HTMLInputElement).checked = newValue;
        return;
      }
      if (key === 'value') {
        (oldNode.domElement as HTMLInputElement).value = newValue;
        return;
      }
      oldNode.domElement?.setAttribute(key, newValue);
    }
  });
  oldNode.props = newNode.props;
}
/**
 * Removes a virtual node and its DOM elements
 */
function removeVNode(vnode: VNode): void {
  switch (vnode.type) {
    case 'primitive':
      vnode.domElement?.remove();
      break;

    case 'html':
      vnode.domElement?.remove();
      vnode.controller?.abort();

      break;

    case 'function':
      if (vnode.topNode) {
        removeVNode(vnode.topNode);
      }
      break;
  }
}

/**
 * Replaces an old virtual node with a new one
 */
function replaceVNode(
  oldNode: VNode,
  newNode: VNode,
): void {
  const element = render(newNode);
  switch (oldNode.type) {
    case 'primitive': {
      oldNode.domElement?.replaceWith(element);
      break;
    }
    case 'html': {
      oldNode.domElement?.replaceWith(element);
      break;
    }
    case 'function': {
      oldNode.topNode?.domElement?.replaceWith(element);
    }
  }
}
