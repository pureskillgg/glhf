/**
 * Create a parallel strategy for an array of events.
 * Resolves and calls the processor for each event element.
 * Resolves and calls onError on each element error.
 * @function createParallelStrategy
 * @param {Object} container The Awilix container.
 * @returns {function} The strategy.
 */
