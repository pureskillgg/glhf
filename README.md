# Good Lambda Have Function

[![npm](https://img.shields.io/npm/v/@pureskillgg/glhf.svg)](https://www.npmjs.com/package/@pureskillgg/glhf)
[![docs](https://img.shields.io/badge/docs-online-informational)](https://pureskillgg.github.io/glhf/)
[![GitHub Actions](https://github.com/pureskillgg/glhf/workflows/main/badge.svg)](https://github.com/pureskillgg/glhf/actions)

Code Lambda for fun and profit.

## Description

This library trivializes creating powerful AWS Lambda handler
functions with minimal boilerplate.

This creates a handler that invokes another AWS Lambda function:

```javascript
import { asClass } from 'awilix'
import { LambdaClient } from '@pureskillgg/awsjs'
import { ssmString } from '@pureskillgg/ace'
import { invokeHandler } from '@pureskillgg/glhf'

const parameters = {
  blueLambdaFunction: ssmString('BLUE_LAMBDA_FUNCTION_SSM_PATH')
}

const createProcessor = ({ blueLambdaClient, log }) => async (
  event,
  container
) => {
  return blueLambdaClient.invokeJson(event)
}

const registerDependencies = (container, config) => {
  container.register(
    'blueLambdaClient',
    asClass(LambdaClient).inject(() => ({
      name: 'blue',
      functionName: config.blueLambdaFunction,
      AwsLambdaClient: undefined,
      params: undefined
    }))
  )
}

export const createHandler = invokeHandler({
  parameters,
  createProcessor,
  registerDependencies
})

export const handler = createHandler(parameters)
```

## Installation

Add this as a dependency to your project using [npm] with

```
$ npm install @pureskillgg/glhf
```

or using [Yarn] with

```
$ yarn add @pureskillgg/glhf
```

[npm]: https://www.npmjs.com/
[Yarn]: https://yarnpkg.com/

## Usage

A trivial handler that does nothing may be created like this

```javascript
import { invokeHandler } from '@pureskillgg/glhf'

const createHandler = invokeHandler()
export const handler = createHandler()
```

To create a more useful handler, leverage
`parameters`, `createProcessor`, and `registerDependencies`,

```javascript
import { invokeHandler } from '@pureskillgg/glhf'

const createHandler = invokeHandler({ createProcessor, registerDependencies })
export const handler = createHandler(parameters)
```

- Use `parameters` to load configuration with [AWS Config Executor].
- Use `registerDependencies` to register things with side-effects
  that should be mocked out in tests.
  This function has access to the configuration loaded via `parameters`.
- Use `createProcessor` to define the business logic for handling each event.
  This function is registered with the [Awilix] container
  as a factory function, thus it can access all dependencies registered
  using `registerDependencies`.

### Handler Factories

All exported handler functions return a new handler factory with identical signature:
  1. `parameters`: The [AWS Config Executor] parameters to load.
  2. `t`: The AVA `t` object (if running inside AVA).
  3. `overrideDependencies`: A function with signature `(container, config) => void`
      which will be called immediately after `registerDependencies`.

These arguments are all designed to facilitate testing.
See [`handlers`](./handlers) and [`test/handlers`](./test/handlers).

The async function returned by the factory has a signature `(event, context) => any`
matching the signature expected by AWS Lambda.

All handlers execute these steps in order:
  1. Load the config defined by the parameters.
  2. Create a new [Awilix] container and register the default dependencies:
     `log`, `reqId`, and `processor`.
  3. Parse the event with the parser.
  4. Execute the processor on the event using the configured strategy and wrapper.
  5. Serialize and return the result.

[AWS Config Executor]: https://github.com/pureskillgg/ace
[Awilix]: https://github.com/jeffijoe/awilix

#### Invoke Handler

The `invokeHandler` handles AWS Lambda invocation events.

An invocation event is a plain JSON serializable JavaScript object.
This handler may thus be used to handle any invocation event
if a more specific handler is not provided.

##### Example

```javascript
import { invokeHandler } from '@pureskillgg/glhf'

const createProcessor = () => async (event, ctx) => {
  return { hello: 'world' }
}

const createHandler = invokeHandler({ createProcessor })

export const handler = createHandler()
```

#### EventBridge Handler

The `eventbridgeHandler` handles [EventBridge events].

##### Dead-letter queue redrive

Additionally, this handler supports redriving events from dead-letter
queues connected to both `onFailure` and event rules.

- EventBridge invokes the function as an [Asynchronous invocation].
- If EventBridge cannot invoke the target function, it will put the event
  in the DLQ after exhausting the allotted retry attempts.
- If EventBridge can invoke the function it will consider the event delivered,
  **even if the function invocation throws an error**.
- If the asynchronous function invocation throws an error,
  it will put the _invocation record_ in the DLQ after exhausting the allotted retry attempts.
- If the DLQ message is from EventBridge, the message body is the event record.
- If the DLQ message is from Lambda, the message body contains
  the event record inside the `requestPayload` attribute.

The example below shows how to configure a Serverless function
that will deliver failed messages to a DLQ and allow redriving
failed messages with the same function.

##### Example

```javascript
import { eventbridgeHandler } from '@pureskillgg/glhf'

const createProcessor = () => async (event, ctx) => {
  return { type: event['detail-type'] }
}

const createHandler = invokeHandler({ createProcessor })

export const handler = createHandler()
```

```yaml
event:
  handler: handlers/event.handler
  destinations:
    onFailure: ${ssm:${self:custom.ssmPrefix}/event_deadletter_queue_arn}
  events:
    - eventBridge:
        eventBus: ${ssm:${self:custom.ssmPrefix}/eventbus_arn}
        deadLetterQueueArn: {ssm:${self:custom.ssmPrefix}/event_deadletter_queue_arn}
    - sqs:
        enabled: false
        arn: ${ssm:${self:custom.ssmPrefix}/event_deadletter_queue_arn}
        batchSize: 1

```

[EventBridge events]: https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-events.html
[Asynchronous invocation]: https://docs.aws.amazon.com/lambda/latest/dg/invocation-async.html

#### SQS Handler

The `sqsHandler` handler handles [SQS events](./fixtures/event/sqs.json).

Since SQS events contain multiple messages,
the default strategy for this handler will execute the processor
on each message in parallel.
Each message will be processed in a child Awilix scope.

The `sqsJsonHandler` behaves like the `sqsHandler` except
it will parse the SQS message body as JSON.

#### HTTP Handler

The `httpHandler` handler handles [API Gateway Proxy events](./fixtures/event/api-gateway-proxy.json).

The handler will catch all processor errors, wrap them with Boom,
and return a basic status code response.
If the processor throws a Boom error, its status code will be respected.

The `httpJsonHandler` behaves like the `httpHandler` except
it will parse the request body as JSON, and if the processor
returns an object with a `body` property, it will
serialize that to JSON and add any missing response properties.

##### Example

```javascript
import { sqsJsonHandler } from '@pureskillgg/glhf'

const createProcessor = () => async (event, ctx) => {
  return event.body
}

const createHandler = sqsJsonHandler({ createProcessor })

export const handler = createHandler()
```

### Advanced usage

The handler functions take additional options:
`parser`, `serializer`, `createWrapper`, and `createStrategy`.
These are advanced features which are stable, but not yet fully documented.
They are used internally to create the included handler factories.
Please refer to the code for how they may be used.

#### Parsers and serializers

A parser is a synchronous function which transforms the raw AWS Lambda event
before it is passed to the processor.

A serializer is a synchronous function which transforms the output of the processor
into the final return value of the AWS Lambda function.

Parsers and serializers should be agnostic to details of user input and response content.
They are not expected to throw runtime errors.
If a parser or serializer throws, it indicates a bug in its implementation,
or a bad configuration (e.g., trying to parse payloads for the wrong event type).

#### Wrappers

A wrapper function must call a strategy with the event and context.
It may optionally call the logger, parser, and serializer.

#### Strategy

A strategy has access to the Awilix container scoped to the event.
It should resolve and call the processor and optionally handle errors.

## Development and Testing

### Quickstart

```
$ git clone https://github.com/pureskillgg/glhf.git
$ cd glhf
$ nvm install
$ yarn install
```

Run the command below in a separate terminal window:

```
$ yarn run test:watch
```

Primary development tasks are defined under `scripts` in `package.json`
and available via `yarn run`.
View them with

```
$ yarn run
```

### Source code

The [source code] is hosted on GitHub.
Clone the project with

```
$ git clone git@github.com:pureskillgg/glhf.git
```

[source code]: https://github.com/pureskillgg/glhf

### Requirements

You will need [Node.js] with [npm], [Yarn], and a [Node.js debugging] client.

Be sure that all commands run under the correct Node version, e.g.,
if using [nvm], install the correct version with

```
$ nvm install
```

Set the active version for each shell session with

```
$ nvm use
```

Install the development dependencies with

```
$ yarn install
```

[Node.js]: https://nodejs.org/
[Node.js debugging]: https://nodejs.org/en/docs/guides/debugging-getting-started/
[npm]: https://www.npmjs.com/
[nvm]: https://github.com/creationix/nvm

### Publishing

Use the [`npm version`][npm-version] command to release a new version.
This will push a new git tag which will trigger a GitHub action.

Publishing may be triggered using on the web
using a [version workflow_dispatch on GitHub Actions].

[npm-version]: https://docs.npmjs.com/cli/version
[version workflow_dispatch on GitHub Actions]: https://github.com/pureskillgg/glhf/actions?query=workflow%3Aversion

### Deployment

Serverless deployment is triggered by a release repository_dispatch on GitHub Actions.

Deployment may be triggered using on the web
using a [release workflow_dispatch on GitHub Actions].

[release workflow_dispatch on GitHub Actions]: https://github.com/pureskillgg/glhf/actions?query=workflow%3Arelease

## GitHub Actions

_GitHub Actions should already be configured: this section is for reference only._

The following repository secrets must be set on [GitHub Actions]:

- `NPM_TOKEN`: npm token for publishing packages.
- `AWS_DEFAULT_REGION`: The AWS region Serverless will deploy to.
- `AWS_ACCESS_KEY_ID`: AWS access key ID.
- `AWS_SECRET_ACCESS_KEY`: AWS secret access key.
- `GH_TOKEN`: A personal access token that can trigger workflows.
- `GRAFANA_API_ORIGIN`: The Grafana origin to push annotations.
- `GRAFANA_API_KEY`: The Grafana key key for pushing annotations.
- `DISCORD_WEBHOOK`: The Discord webhook to notify on deploy.
- `SENTRY_AUTH_TOKEN`: The Sentry auth token.

These must be set manually.

### Secrets for Optional GitHub Actions

The version and format GitHub actions
require a user with write access to the repository.
including access to trigger workflows and read and write packages.

Set these additional secrets to enable the action:

- `GH_USER`: The GitHub user's username.
- `GH_TOKEN`: A personal access token for the user.
- `GIT_USER_NAME`: The GitHub user's real name.
- `GIT_USER_EMAIL`: The GitHub user's email.
- `GPG_PRIVATE_KEY`: The GitHub user's [GPG private key].
- `GPG_PASSPHRASE`: The GitHub user's GPG passphrase.

[GitHub Actions]: https://github.com/features/actions
[GPG private key]: https://github.com/marketplace/actions/import-gpg#prerequisites

## Contributing

Please submit and comment on bug reports and feature requests.

To submit a patch:

1. Fork it (https://github.com/pureskillgg/glhf/fork).
2. Create your feature branch (`git checkout -b my-new-feature`).
3. Make changes.
4. Commit your changes (`git commit -am 'Add some feature'`).
5. Push to the branch (`git push origin my-new-feature`).
6. Create a new Pull Request.

## License

This npm package is licensed under the MIT license.

Portions of code in this project were taken and adapted from
[@meltwater/jackalambda] which is licensed under the MIT license.

[@meltwater/jackalambda]: https://github.com/meltwater/jackalambda

## Warranty

This software is provided by the copyright holders and contributors "as is" and
any express or implied warranties, including, but not limited to, the implied
warranties of merchantability and fitness for a particular purpose are
disclaimed. In no event shall the copyright holder or contributors be liable for
any direct, indirect, incidental, special, exemplary, or consequential damages
(including, but not limited to, procurement of substitute goods or services;
loss of use, data, or profits; or business interruption) however caused and on
any theory of liability, whether in contract, strict liability, or tort
(including negligence or otherwise) arising in any way out of the use of this
software, even if advised of the possibility of such damage.
