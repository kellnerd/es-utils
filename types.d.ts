
export type MaybeArray<T> = T | Array<T>;

export type MaybePromise<T> = T | Promise<T>;

export type FormDataRecord = Record<string, MaybeArray<string>>;

export type KeyMapping<Source, Target> = Record<keyof Source, keyof Target>;

/** Parameters for `String.replace()` (custom definition, `Parameters<String['replace']>` uses the wrong overload). */
export type SubstitutionRule = [
	searchValue: string | RegExp,
	replaceValue: string | ((match: string, ...args: any[]) => string),
];
