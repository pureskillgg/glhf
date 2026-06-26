# Good Lambda Have Function

[![npm](https://img.shields.io/npm/v/@pureskillgg/glhf.svg)](https://www.npmjs.com/package/@pureskillgg/glhf)
[![docs](https://img.shields.io/badge/docs-online-informational)](https://dev.pureskill.gg/glhf/)
[![GitHub Actions](https://github.com/pureskillgg/glhf/workflows/main/badge.svg)](https://github.com/pureskillgg/glhf/actions)

Code Lambda for fun and profit.

glhf ("Good Lambda Have Function") is a reusable Node.js / ESM library that builds
AWS Lambda handler factories with minimal boilerplate, wiring up config loading,
an [Awilix] dependency-injection container, structured logging, and per-event-source
parsing, serialization, and error-handling strategies.

## What it does

glhf exports a family of **handler-factory functions**, one per AWS Lambda event
source. Each is a thin wrapper around a central `createHandler` factory so the same
engine serves every event type:

- **`invokeHandler`** — raw Lambda invocation / arbitrary JSON events (the default
  / fallback handler). Identity parser and serializer, single-run event strategy.
- **`eventbridgeHandler`** — [EventBridge events], with dead-letter-queue redrive
  support that transparently unwraps both EventBridge-origin and Lambda-`onFailure`
  DLQ records.
- **`sqsHandler`** / **`sqsJsonHandler`** — SQS batches, processed **per record in
  parallel**, each in its own Awilix child scope. The JSON variant also parses each
  message body as JSON.
- **`httpHandler`** / **`httpJsonHandler`** — API Gateway HTTP API v2 proxy events,
  with [Boom]-based mapping of processor errors to HTTP status codes. The JSON
  variant parses the request body and serializes the response body to JSON.

Every handler follows the same lifecycle. On cold start it creates a cache
([cache-manager], 60s TTL) and an Awilix container; per invocation it builds a
request context (`ctx`), derives a request id, creates a child structured logger,
loads configuration via [AWS Config Executor], registers the caller's dependencies,
creates a scoped container, and runs the chosen **strategy** through a **wrapper**
that parses the event, invokes the caller's processor, logs start/data/end, and
serializes the result.

The design deliberately separates four pluggable concerns — **parser**,
**serializer**, **wrapper**, and **strategy** — so the same core factory powers
every event source. See [Handler lifecycle and DI scoping](./docs/handler-lifecycle.md)
for the full flow and the parent-vs-per-event-vs-per-record scoping model.

## Pipeline role

glhf is a foundational **shared library** (published to npm as `@pureskillgg/glhf`),
not a pipeline stage itself. Virtually every Node.js Lambda across the PureSkill.gg
CS2 pipeline imports it to create its `handler` export — for example `csgo-mutator`,
`csgo-profile`, `oauthjs`, automatch and link services, AppSync resolvers, and
EventBridge / SQS / HTTP consumers.

It sits alongside the other internal libraries it composes: it loads config with
[`@pureskillgg/ace`][AWS Config Executor] (SSM / env descriptors), logs with
`@pureskillgg/mlabs-logger`, and uses functional utilities from `@pureskillgg/phi`.
glhf standardizes how all of these services parse events, load config, log, and
handle errors so each consuming repo only writes its own `parameters`,
`registerDependencies`, and `createProcessor`.

This library has **no production AWS infrastructure of its own**. The `serverless.yml`,
`serverless/*.yml`, and `handlers/` in this repo exist only as a red/blue
**example / integration-test deployment** used to exercise the library end to end
(see [Example deployment](#example-deployment-redblue)).

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

The full lifecycle of an event is explained below:
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
`logOptions`, `parser`, `serializer`, `createWrapper`, and `createStrategy`.
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

## Building blocks

Every handler factory is composed from the same internal primitives. These are the
real exported names confirmed in [`lib`](./lib); consuming services usually only need
the handler factories, but the pieces are exported for advanced use and custom handlers.

### Handler factories (`lib/handlers`)

| Export | Source | Role |
| --- | --- | --- |
| `invokeHandler` | `lib/handlers/invoke.js` | Raw invocation / generic JSON; identity parser + serializer, event strategy |
| `eventbridgeHandler` | `lib/handlers/eventbridge.js` | EventBridge events; eventbridge parser + parallel strategy; DLQ redrive |
| `sqsHandler` / `sqsJsonHandler` | `lib/handlers/sqs.js` | SQS batches; per-record parallel processing in child scopes |
| `httpHandler` / `httpJsonHandler` | `lib/handlers/http.js` | API Gateway HTTP API v2; HTTP strategy maps errors to status codes |
| `createHandler` | `lib/handlers/factory.js` | Central engine all factories delegate to (cache, container, config, scope, run) |

### Strategies (`lib/strategies`)

| Export | Behavior |
| --- | --- |
| `createEventStrategy` | Resolves and runs the processor once; resolves an optional `onError` |
| `createParallelStrategy` | Validates the parsed event is an array; runs the processor on each record concurrently (`Promise.all`), each in its own child scope |
| `createHttpStrategy` | Catches processor errors, boomifies them, logs a warning, returns `{ statusCode }` |

### Wrappers (`lib/wrappers`)

| Export | Role |
| --- | --- |
| `createInvokeWrapper` | Orchestrates parse → strategy → serialize with start/data/end logging |
| `createRecordWrapper` | Per-record inner loop for the parallel strategy (own ctx/log per record) |

### Parsers and serializers (`lib/parsers`, `lib/serializers`)

- **Parsers:** `identityParser`, `sqsParser` / `sqsJsonParser`, `eventbridgeParser`,
  `recordsParser`, `apiGatewayProxyParser` / `apiGatewayProxyJsonParser`. These normalize
  raw events — typing SQS attributes (String / Number / Binary), unwrapping DLQ records,
  and validating API Gateway v2 (`version` `2.0`) payloads.
- **Serializers:** `identitySerializer`, `apiGatewayProxySerializer` /
  `apiGatewayProxyJsonSerializer`. The JSON variant stringifies `body` and fills in
  default HTTP response fields.

### Utilities

`createCtx` (`lib/ctx.js`), `getRequestId` (`lib/request-id.js`),
`discoverEventType` (`lib/event/discover.js` — distinguishes `aws:sqs` from everything
else), `createLogger` / `logFatal` (`lib/logger.js`), `createGetConfig` wrapping ace's
`getConfig` (`lib/config.js`), `createScope` / `registerContext` (`lib/container.js`),
`createCache` (`lib/cache.js`, 60s TTL), `readJson` (`lib/fs.js`), and `securityHeaders`
(`lib/headers.js`).

## Observability

glhf is a published library, not a deployed service, so there is **no application AWS
infrastructure to inspect** — no DynamoDB, SQS, SNS, Step Functions, EventBridge,
AppSync, or CloudFront in this repo. The observability behavior below is what the library
establishes for **consuming services**; find runtime logs in the consuming Lambda's own
CloudWatch log groups (`/aws/lambda/<consumer-service>-<stage>-<function>`).

- **Structured logs.** Every handler emits structured logs via
  `@pureskillgg/mlabs-logger`. The factory seeds a child logger with env metadata and
  AWS request context, derives a `reqId` (from SQS message attributes, `event.reqId`, or
  a fresh uuid), and logs **start / data / end** around each processor run. Verbosity is
  controlled by `LOG_LEVEL` (defaults to `info`); the consuming service also sets
  `LOG_ENV`, `LOG_SYSTEM`, `LOG_SERVICE`, and `LOG_VERSION`. To trace a single
  invocation, filter the consumer's log group by its `reqId`.
- **Errors.** Synchronous invoke errors propagate to the caller. HTTP handlers convert
  errors to status codes with `@hapi/boom` (`createHttpStrategy`). glhf itself wires no
  DLQ or retry sink — those belong to the consuming service's Serverless config; the
  `eventbridgeHandler` is what lets a service **redrive** its own EventBridge / `onFailure`
  DLQ messages (see the deep-dive below).
- **Sentry.** glhf does not bundle Sentry; consuming services typically wrap their handler
  with `@sentry/serverless`. The example deploy in this repo demonstrates that pattern.

### Example deployment (red/blue)

The `serverless.yml` + `serverless/*.yml` + `handlers/` exist **only** as an
integration test of the library, deployed under service `glhf` (default stage `stg`):

- **`glhf-${sls:stage}-red`** (`handlers/red.handler`) — reads
  `BLUE_LAMBDA_FUNCTION_SSM_PATH` via ace's `ssmString` and invokes the blue Lambda
  through `@pureskillgg/awsjs` `LambdaClient`.
- **`glhf-${sls:stage}-blue`** (`handlers/blue.handler`, env `RANK=ge`) — the downstream
  target invoked by red.
- **SSM parameter** `/pureskillgg/glhf/${stage}/glhf/blue_lambda_function`
  (`AWS::SSM::Parameter`, type `String`, `Value: Ref BlueLambdaFunction` in
  `serverless/resources.yml`) — holds the deployed blue function; red reads it and IAM
  grants `ssm:GetParameter` on `/${owner}/${app}/${stage}/${name}/*`.
- Example handlers are Sentry-wrapped (`Sentry.AWSLambda.wrapHandler`, with the
  `SentryNodeServerlessSDK:40` Lambda layer) purely to exercise the consumer pattern.

Log groups for the example deploy (30-day retention): `/aws/lambda/glhf-${sls:stage}-red`
and `/aws/lambda/glhf-${sls:stage}-blue`.

> Note: the `httpApi` block in `serverless.yml` has its default endpoint disabled and **no
> function attaches an `httpApi` event**, so no API Gateway is actually provisioned for
> the example.

## Documentation

- [Handler lifecycle and DI scoping](./docs/handler-lifecycle.md) — the cold-start →
  per-invocation → per-record flow, the parent / per-event / per-record Awilix scope
  model, and how EventBridge DLQ redrive unwrapping works. Start here if a consuming
  service's dependencies or `reqId` are not what you expect.

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
[Boom]: https://hapi.dev/module/boom/
[cache-manager]: https://www.npmjs.com/package/cache-manager

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
