/**
 * Create an HTTP strategy.
 * Resolves and calls the processor for the event.
 * Swallows all errors, wraps them as a Boom object,
 * resolves and calls onError on the wrapped error,
 * and returns a matching status code response.
 * @function createEventStrategy
 * @param {Object} container The Awilix container.
 * @returns {Object[]} The strategy.
 */
