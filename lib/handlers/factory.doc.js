/**
 * Create a basic event handler factory.
 * See the README for an explanation of how to use the returned handler factory.
 * @function createHandler
 * @param {Object} parameters
 * @param {string} [parameters.parser=identityParser] Event parser.
 * @param {string} [parameters.serializer=identitySerializer] Payload serializer.
 * @param {string} [parameters.createProcessor=createNullProcessor] Processor factory.
 * @param {string} [parameters.createWrapper=createInvokeWrapper] Wrapper factory.
 * @param {string} [parameters.createStrategy=createEventStrategy] Strategy factory.
 * @param {string} [parameters.registerDependencies=registerEmptyDependencies] Called to register dependencies.
 * @returns {Object} The handler factory.
 */
