// Adapted from https://stackoverflow.com/a/46012210

const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;

/**
 * Sets the value of an input element which has been manipulated by React.
 * Deprecated: Use setReactInputSelectTextareaValue instead
 * @param {HTMLInputElement} input 
 * @param {string} value 
 */
export function setReactInputValue(input, value) {
	nativeInputValueSetter.call(input, value);
	input.dispatchEvent(new Event('input', { bubbles: true }));
}

const nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;

/**
 * Sets the value of a textarea input element which has been manipulated by React.
 * Deprecated: Use setReactInputSelectTextareaValue instead
 * @param {HTMLTextAreaElement} input 
 * @param {string} value 
 */
export function setReactTextareaValue(input, value) {
	nativeTextareaValueSetter.call(input, value);
	input.dispatchEvent(new Event('input', { bubbles: true }));
}

// MB React input logics often requires: input event, update value, then change event
// https://github.com/jesus2099/konami-command/blob/a94c502bd7d5f4f4e29c91c7ac2a52881c96821e/lib/SUPER.js#L163-L171

/**
 * Sets the value of an input/select/textarea element which has been manipulated by React.
 * @param {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement} input
 * @param {string} value
 */
export function setReactInputSelectTextareaValue(input, value) {
	input.dispatchEvent(new Event('input', { bubbles: true }));
	(Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value').set).call(input, value);
	input.dispatchEvent(new Event('change', { bubbles: true }));
}
