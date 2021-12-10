/**
 * Create a handler factory for EventBridge events.
 * Handles EventBridge rule events and redriven events from SQS.
 * See the README for an explanation of how to use the returned handler factory.
 * @function eventbridgeHandler
 * @param {Object} options Overrides passed to createHandler.
 * @returns {Object} The handler factory.
 * @see {@link createHandler}
 */
