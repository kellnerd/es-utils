
/**
 * Creates an object from the given arrays of keys and corresponding values.
 * @template T
 * @param {PropertyKey[]} keys
 * @param {T[]} values
 */
export function zipObject(keys, values) {
	return Object.fromEntries(keys.map((_, index) => [keys[index], values[index]]));
}
