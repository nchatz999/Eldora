/**
 * @module jsx-runtime
 * @description JSX runtime implementation
 *
 * Provides the necessary functions and types for JSX compilation and runtime.
 * Enables JSX/TSX syntax support in the framework.
 */

import { VNode } from './core.ts';
import { eldoraJSX } from './dom.ts';
import { EldoraElements } from './html.ts';

/**
 * JSX namespace required for TypeScript JSX compilation
 * Provides type definitions for intrinsic elements and custom components
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
// deno-lint-ignore no-namespace
export namespace JSX {
    /**
     * Maps HTML tag names to their attribute types
     * Allows TypeScript to type-check JSX elements
     */
    export type IntrinsicElements = EldoraElements;
    /**
     * Defines the type for all JSX elements
     * Used by TypeScript to type-check JSX expressions
     */
    export type Element = VNode;
}

export const jsx = eldoraJSX;
export const jsxs = eldoraJSX;
export const jsxDEV = eldoraJSX;
