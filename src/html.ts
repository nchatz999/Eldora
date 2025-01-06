/**
 * @module html
 * @description HTML element and attribute type definitions
 *
 * Comprehensive type definitions for HTML elements, attributes, and events.
 * Provides type safety for JSX/TSX usage.
 */
import { RefObject, VNode } from './core.ts';

/**
 * Generic event handler type
 * @template E - Event type
 */
type EventHandler<E extends Event> = (event: E) => void;
/**
 * Interface defining all supported HTML event handlers
 */
interface HTMLEventHandlers {
  onClick?: EventHandler<MouseEvent>;
  onDoubleClick?: EventHandler<MouseEvent>;
  onMouseDown?: EventHandler<MouseEvent>;
  onMouseUp?: EventHandler<MouseEvent>;
  onMouseOver?: EventHandler<MouseEvent>;
  onMouseOut?: EventHandler<MouseEvent>;
  onMouseMove?: EventHandler<MouseEvent>;
  onMouseEnter?: EventHandler<MouseEvent>;
  onMouseLeave?: EventHandler<MouseEvent>;
  onContextMenu?: EventHandler<MouseEvent>;
  onWheel?: EventHandler<WheelEvent>;

  onTouchStart?: EventHandler<TouchEvent>;
  onTouchEnd?: EventHandler<TouchEvent>;
  onTouchMove?: EventHandler<TouchEvent>;
  onTouchCancel?: EventHandler<TouchEvent>;

  onKeyDown?: EventHandler<KeyboardEvent>;
  onKeyUp?: EventHandler<KeyboardEvent>;
  onKeyPress?: EventHandler<KeyboardEvent>;

  onChange?: EventHandler<Event>;
  onInput?: EventHandler<Event>;
  onSubmit?: EventHandler<Event>;
  onReset?: EventHandler<Event>;
  onInvalid?: EventHandler<Event>;
  onBeforeInput?: EventHandler<InputEvent>;

  onFocus?: EventHandler<FocusEvent>;
  onBlur?: EventHandler<FocusEvent>;
  onFocusIn?: EventHandler<FocusEvent>;
  onFocusOut?: EventHandler<FocusEvent>;

  onCopy?: EventHandler<ClipboardEvent>;
  onCut?: EventHandler<ClipboardEvent>;
  onPaste?: EventHandler<ClipboardEvent>;

  onDrag?: EventHandler<DragEvent>;
  onDragEnd?: EventHandler<DragEvent>;
  onDragEnter?: EventHandler<DragEvent>;
  onDragExit?: EventHandler<DragEvent>;
  onDragLeave?: EventHandler<DragEvent>;
  onDragOver?: EventHandler<DragEvent>;
  onDragStart?: EventHandler<DragEvent>;
  onDrop?: EventHandler<DragEvent>;

  onSelect?: EventHandler<Event>;
  onSelectionChange?: EventHandler<Event>;

  onAnimationStart?: EventHandler<AnimationEvent>;
  onAnimationEnd?: EventHandler<AnimationEvent>;
  onAnimationIteration?: EventHandler<AnimationEvent>;

  onTransitionEnd?: EventHandler<TransitionEvent>;

  onScroll?: EventHandler<Event>;

  onLoad?: EventHandler<Event>;
  onError?: EventHandler<Event>;

  onPlay?: EventHandler<Event>;
  onPause?: EventHandler<Event>;
  onPlaying?: EventHandler<Event>;
  onEnded?: EventHandler<Event>;
  onLoadedData?: EventHandler<Event>;
  onLoadedMetadata?: EventHandler<Event>;
  onVolumeChange?: EventHandler<Event>;
  onTimeUpdate?: EventHandler<Event>;

  onPointerDown?: EventHandler<PointerEvent>;
  onPointerUp?: EventHandler<PointerEvent>;
  onPointerMove?: EventHandler<PointerEvent>;
  onPointerOver?: EventHandler<PointerEvent>;
  onPointerOut?: EventHandler<PointerEvent>;
  onPointerEnter?: EventHandler<PointerEvent>;
  onPointerLeave?: EventHandler<PointerEvent>;
  onPointerCancel?: EventHandler<PointerEvent>;

  onCompositionStart?: EventHandler<CompositionEvent>;
  onCompositionEnd?: EventHandler<CompositionEvent>;
  onCompositionUpdate?: EventHandler<CompositionEvent>;

  onResize?: EventHandler<UIEvent>;

  onCustomEvent?: EventHandler<CustomEvent>;
}

/**
 * Common HTML attributes shared across elements
 */
interface CommonHTMLAttributes {
  id?: string;
  className?: string;
  style?: Partial<CSSStyleDeclaration>;
  title?: string;
  dir?: 'ltr' | 'rtl' | 'auto';
  lang?: string;
  tabIndex?: number;
  hidden?: boolean;
  draggable?: boolean;
  contentEditable?: boolean;
  spellCheck?: boolean;
  translate?: 'yes' | 'no';
}

/**
 * Form-specific attributes
 */
interface FormAttributes {
  accept?: string;
  acceptCharset?: string;
  action?: string;
  autoComplete?: 'on' | 'off';
  autoFocus?: boolean;
  checked?: boolean;
  disabled?: boolean;
  encType?: string;
  form?: string;
  formMethod?: 'get' | 'post';
  formNoValidate?: boolean;
  formTarget?: string;
  max?: number | string;
  maxLength?: number;
  min?: number | string;
  minLength?: number;
  multiple?: boolean;
  name?: string;
  pattern?: string;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  size?: number;
  src?: string;
  step?: number | 'any';
  type?: string;
  value?: string | number | readonly string[];
}

/**
 * ARIA accessibility attributes
 */
interface AriaAttributes {
  role?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaLabelledBy?: string;
  ariaHidden?: boolean;
  ariaDisabled?: boolean;
  ariaRequired?: boolean;
  ariaExpanded?: boolean;
  ariaSelected?: boolean;
  ariaChecked?: boolean | 'mixed';
  ariaValueNow?: number;
  ariaValueMin?: number;
  ariaValueMax?: number;
  ariaValueText?: string;
  ariaLive?: 'off' | 'assertive' | 'polite';
}

/**
 * Combined HTML attributes type with generic element type
 * @template T - HTML element type
 */
export type HTMLAttributes<T> =
  & {
    children?: (VNode | string | number)[] | (VNode | string | number);
  }
  & CommonHTMLAttributes
  & HTMLEventHandlers
  & Partial<FormAttributes>
  & AriaAttributes
  & {
    ref?: RefObject<T>;
    [key: `data-${string}`]: string | undefined;
  };

/**
 * Type definitions for all supported HTML elements
 * Maps element names to their corresponding attribute types
 */
export interface EldoraElements {
  address: HTMLAttributes<HTMLElement>;
  article: HTMLAttributes<HTMLElement>;
  aside: HTMLAttributes<HTMLElement>;
  blockquote: HTMLAttributes<HTMLQuoteElement>;
  details: HTMLAttributes<HTMLDetailsElement>;
  dialog: HTMLAttributes<HTMLDialogElement>;
  dd: HTMLAttributes<HTMLElement>;
  div: HTMLAttributes<HTMLDivElement>;
  dl: HTMLAttributes<HTMLDListElement>;
  dt: HTMLAttributes<HTMLElement>;

  figcaption: HTMLAttributes<HTMLElement>;
  figure: HTMLAttributes<HTMLElement>;
  footer: HTMLAttributes<HTMLElement>;
  form: HTMLAttributes<HTMLFormElement>;
  h1: HTMLAttributes<HTMLHeadingElement>;
  h2: HTMLAttributes<HTMLHeadingElement>;
  h3: HTMLAttributes<HTMLHeadingElement>;
  h4: HTMLAttributes<HTMLHeadingElement>;
  h5: HTMLAttributes<HTMLHeadingElement>;
  h6: HTMLAttributes<HTMLHeadingElement>;
  header: HTMLAttributes<HTMLElement>;
  hr: HTMLAttributes<HTMLHRElement>;

  li: HTMLAttributes<HTMLLIElement>;
  main: HTMLAttributes<HTMLElement>;
  nav: HTMLAttributes<HTMLElement>;
  ol: HTMLAttributes<HTMLOListElement>;
  p: HTMLAttributes<HTMLParagraphElement>;
  pre: HTMLAttributes<HTMLPreElement>;
  section: HTMLAttributes<HTMLElement>;

  ul: HTMLAttributes<HTMLUListElement>;

  a: HTMLAttributes<HTMLAnchorElement>;
  abbr: HTMLAttributes<HTMLElement>;
  b: HTMLAttributes<HTMLElement>;
  bdi: HTMLAttributes<HTMLElement>;
  bdo: HTMLAttributes<HTMLElement>;
  br: HTMLAttributes<HTMLBRElement>;
  cite: HTMLAttributes<HTMLElement>;
  code: HTMLAttributes<HTMLElement>;
  data: HTMLAttributes<HTMLDataElement>;
  dfn: HTMLAttributes<HTMLElement>;
  em: HTMLAttributes<HTMLElement>;
  i: HTMLAttributes<HTMLElement>;
  img: HTMLAttributes<HTMLImageElement>;
  input: HTMLAttributes<HTMLInputElement>;
  ins: HTMLAttributes<HTMLModElement>;
  kbd: HTMLAttributes<HTMLElement>;
  label: HTMLAttributes<HTMLLabelElement>;
  mark: HTMLAttributes<HTMLElement>;
  meter: HTMLAttributes<HTMLMeterElement>;
  output: HTMLAttributes<HTMLOutputElement>;
  picture: HTMLAttributes<HTMLPictureElement>;
  progress: HTMLAttributes<HTMLProgressElement>;
  q: HTMLAttributes<HTMLQuoteElement>;
  ruby: HTMLAttributes<HTMLElement>;
  s: HTMLAttributes<HTMLElement>;
  samp: HTMLAttributes<HTMLElement>;
  script: HTMLAttributes<HTMLScriptElement>;

  slot: HTMLAttributes<HTMLSlotElement>;
  small: HTMLAttributes<HTMLElement>;
  span: HTMLAttributes<HTMLSpanElement>;
  strong: HTMLAttributes<HTMLElement>;
  sub: HTMLAttributes<HTMLElement>;
  sup: HTMLAttributes<HTMLElement>;
  svg: HTMLAttributes<SVGElement>;
  template: HTMLAttributes<HTMLTemplateElement>;
  textarea: HTMLAttributes<HTMLTextAreaElement>;
  time: HTMLAttributes<HTMLTimeElement>;
  u: HTMLAttributes<HTMLElement>;
  var: HTMLAttributes<HTMLElement>;
  wbr: HTMLAttributes<HTMLElement>;

  button: HTMLAttributes<HTMLButtonElement>;
  datalist: HTMLAttributes<HTMLDataListElement>;
  fieldset: HTMLAttributes<HTMLFieldSetElement>;
  legend: HTMLAttributes<HTMLLegendElement>;
  optgroup: HTMLAttributes<HTMLOptGroupElement>;
  option: HTMLAttributes<HTMLOptionElement>;
  select: HTMLAttributes<HTMLSelectElement>;

  caption: HTMLAttributes<HTMLTableCaptionElement>;
  col: HTMLAttributes<HTMLTableColElement>;
  colgroup: HTMLAttributes<HTMLTableColElement>;
  table: HTMLAttributes<HTMLTableElement>;
  tbody: HTMLAttributes<HTMLTableSectionElement>;
  td: HTMLAttributes<HTMLTableCellElement>;
  tfoot: HTMLAttributes<HTMLTableSectionElement>;
  th: HTMLAttributes<HTMLTableCellElement>;
  thead: HTMLAttributes<HTMLTableSectionElement>;
  tr: HTMLAttributes<HTMLTableRowElement>;
}
