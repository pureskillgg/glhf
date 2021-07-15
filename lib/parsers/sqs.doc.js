/**
 * SQS event parser.
 * @function sqsParser
 * @param {Object} event The event.
 * @returns {Object[]} The messages from the parsed event.
 *          Both attributes and messageAttributes are parsed into plain objects
 *          with proper types.
 */

/**
 * SQS JSON event parser.
 * @function sqsJsonParser
 * @param {Object} event The event.
 * @returns {Object[]} The messages from the parsed event with the body parsed as JSON.
 *          Both attributes and messageAttributes are parsed into plain objects
 *          with proper types.
 */
