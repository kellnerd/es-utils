
/**
 * Flattens the given (potentially nested) record into a record with a single hierarchy level.
 * Concatenates the keys in a nested structure which lead to a value with dots.
 * @param {Record<string, any>} record 
 * @param {string[]} preservedKeys - Keys whose values will be preserved.
 * @returns {Record<string, any>}
 */
export function flatten(record, preservedKeys = []) {
	const flatRecord = {};

	for (const key in record) {
		let value = record[key];
		if (typeof value === 'object' && value !== null && !preservedKeys.includes(key)) { // also matches arrays
			value = flatten(value, preservedKeys);
			for (const childKey in value) {
				flatRecord[key + '.' + childKey] = value[childKey]; // concatenate keys
			}
		} else if (value !== undefined) { // value is already flat (e.g. a string) or should be preserved
			flatRecord[key] = value; // keep the key
		}
	}

	return flatRecord;
}
