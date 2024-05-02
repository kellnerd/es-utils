// Adapted from https://thoughtspile.github.io/2018/07/07/rate-limit-promises/

import { delay } from './delay.js';

function rateLimitedQueue(operation, {
	interval,
	maxQueueSize = Infinity,
	queueFullError = 'Max queue size reached',
}) {
	// Empty queue is ready.
	let queue = Promise.resolve();
	let queueSize = 0;

	return (...args) => {
		if (queueSize >= maxQueueSize) {
			return Promise.reject(new Error(queueFullError));
		}

		// Queue the next operation.
		const result = queue.then(() => operation(...args));
		queueSize++;

		// Decrease queue size when the operation finishes (succeeds or fails).
		result.then(() => { queueSize-- }, () => { queueSize-- });

		// Start the next delay, regardless of the last operation's success.
		queue = queue.then(() => delay(interval), () => delay(interval));

		return result;
	};
}

function queue(operation) {
	let queue = Promise.resolve(); // empty queue is ready
	return (...args) => {
		// queue the next operation, regardless of the last operation's success
		queue = queue.then(() => operation(...args), () => operation(...args));
		return queue; // now points to the result of the just enqueued operation
	};
}

/**
 * Limits the number of requests for the given operation within a time interval.
 * @template Params
 * @template Result
 * @param {(...args: Params) => Result} operation Operation that should be rate-limited.
 * @param {object} options
 * @param {number} options.interval Time interval (in ms).
 * @param {number} [options.requestsPerInterval] Maximum number of requests within the interval.
 * @param {number} [options.maxQueueSize] Maximum number of requests which are queued (optional).
 * @param {string} [options.queueFullError] Error message when the queue is full.
 * @returns {(...args: Params) => Promise<Awaited<Result>>} Rate-limited version of the given operation.
 */
export function rateLimit(operation, options) {
	const { requestsPerInterval = 1 } = options;

	if (requestsPerInterval == 1) {
		return rateLimitedQueue(operation, options);
	}

	const queues = Array(requestsPerInterval).fill().map(() => rateLimitedQueue(operation, options));
	let queueIndex = 0;

	return (...args) => {
		queueIndex = (queueIndex + 1) % requestsPerInterval; // use the next queue
		return queues[queueIndex](...args); // return the result of the operation
	};
}

/**
 * Limits the number of simultaneous requests for the given operation.
 * @template Params
 * @template Result
 * @param {(...args: Params) => Result} operation Operation that should be limited in its use.
 * @param {number} concurrency Maximum number of concurrent requests at any time.
 * @returns {(...args: Params) => Promise<Awaited<Result>>} Concurrency-limited version of the given operation.
 */
export function limit(operation, concurrency = 1) {
	if (concurrency == 1) {
		return queue(operation);
	}
	const queues = Array(concurrency).fill().map(() => queue(operation));
	let queueIndex = 0;
	return (...args) => {
		queueIndex = (queueIndex + 1) % concurrency; // use the next queue
		return queues[queueIndex](...args); // return the result of the operation
	};
}
