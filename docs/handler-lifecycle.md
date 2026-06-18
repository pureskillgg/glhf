# Handler lifecycle and DI scoping

This is a companion to the [README](../README.md) covering the single most
intricate part of glhf: how every handler factory turns a raw AWS Lambda event
into a processor call, and how the [Awilix] container is scoped along the way.
All handler factories (`invokeHandler`, `eventbridgeHandler`, `sqsHandler`,
`httpHandler`, …) delegate to the central `createHandler` factory in
[`lib/handlers/factory.js`](../lib/handlers/factory.js); the differences between
them are entirely in which **parser**, **serializer**, **wrapper**, and
**strategy** they plug in.

## Cold start vs per invocation

**On cold start** (module load, once per container):

1. A cache is created via `createCache` ([`lib/cache.js`](../lib/cache.js)) using
   [cache-manager] with a **60-second TTL**.
2. A root Awilix container is created.

**On every invocation** `(event, context)`:

1. **Build `ctx`** (`createCtx`, [`lib/ctx.js`](../lib/ctx.js)). This discovers the
   event type and derives the request id:
   - `discoverEventType` ([`lib/event/discover.js`](../lib/event/discover.js)) only
     distinguishes two cases — an `aws:sqs` event (Symbol `sqs`) vs **everything
     else** (Symbol `lambda`). That is the whole event taxonomy; the more specific
     parsing happens in the per-handler parser.
   - `getRequestId` ([`lib/request-id.js`](../lib/request-id.js)) derives `reqId`
     from SQS message attributes, then `event.reqId`, and finally a fresh `uuid`.
2. **Create a child logger** (`createLogger`, [`lib/logger.js`](../lib/logger.js))
   seeded with env metadata (`LOG_ENV` / `LOG_SYSTEM` / `LOG_SERVICE` /
   `LOG_VERSION`) and the AWS request context, at the `LOG_LEVEL` verbosity.
3. **Load config** via `createGetConfig` ([`lib/config.js`](../lib/config.js)),
   which wraps [AWS Config Executor]'s `getConfig` using the caller-supplied
   `parameters` (SSM / env descriptors). The 60s cache means repeated warm
   invocations do not re-fetch SSM on every call.
4. **Register dependencies**: the caller's `registerDependencies(container, config)`
   runs, then any test-time `overrideDependencies(container, config)` runs
   immediately after (this is how AVA tests swap in fakes).
5. **Create a scoped container** (`createScope` / `registerContext`,
   [`lib/container.js`](../lib/container.js)) that registers the per-request
   `reqId`, `log`, and the caller's `createProcessor` as the scoped `processor`.
6. **Run the strategy through the wrapper**: the wrapper parses the event,
   invokes the strategy (which resolves and calls `processor`), logs
   **start / data / end**, and serializes the result.

## Why the scoping matters

There are up to three container layers, and getting them confused is the most
common mistake when consuming glhf:

- **Root container** — created once at cold start. Long-lived singletons that are
  safe to reuse across invocations can live here, but `registerDependencies` runs
  per invocation because it needs the freshly loaded `config`.
- **Per-event scope** — created each invocation. `reqId`, `log`, and `processor`
  are registered here so that anything resolved during this invocation sees the
  correct request id and request-scoped logger.
- **Per-record scope** — only for the **parallel** strategy (SQS, EventBridge).
  `createParallelStrategy` ([`lib/strategies/parallel.js`](../lib/strategies/parallel.js))
  asserts the parsed event is an array and then runs the processor on each record
  **concurrently** via `Promise.all`. Each record gets its own child scope and its
  own `ctx` / `log` through `createRecordWrapper`
  ([`lib/wrappers/record.js`](../lib/wrappers/record.js)). So within a batch, each
  message's processor sees a per-record logger — not one shared logger for the
  whole batch.

The single-run strategies are simpler:

- `createEventStrategy` ([`lib/strategies/event.js`](../lib/strategies/event.js))
  resolves and runs the processor once, resolving an optional `onError`.
- `createHttpStrategy` ([`lib/strategies/http.js`](../lib/strategies/http.js))
  catches processor errors, boomifies them with `@hapi/boom`, logs a warning, and
  returns a `{ statusCode }` response (a thrown Boom error's status code is
  respected).

## EventBridge DLQ redrive unwrapping

The `eventbridgeHandler` is what lets a consuming service redrive its own failed
events, and the subtlety lives in `eventbridgeParser`
([`lib/parsers/eventbridge.js`](../lib/parsers/eventbridge.js)). A message landing
in a dead-letter queue can have **two different shapes** depending on who put it
there:

- **From EventBridge** (the event-rule DLQ, when EventBridge could not invoke the
  function at all): the message body **is** the event record.
- **From Lambda `onFailure`** (when EventBridge delivered the event but the async
  invocation threw): the event record is nested inside the `requestPayload`
  attribute of the invocation record.

The parser normalizes both back into plain event records (unwrapping the SQS-DLQ
`Records` via the SQS-JSON path and pulling out `requestPayload` when present), so
the same processor can handle a live event and a redriven one identically. In a
consuming service this is wired with a **disabled** (`enabled: false`) SQS trigger
on the DLQ alongside the EventBridge trigger — see the README's EventBridge
example — so the queue can be drained back through the same function on demand.

## Where to look when something is wrong

- **Unexpected `reqId`** → check the precedence in
  [`lib/request-id.js`](../lib/request-id.js): SQS attributes win, then
  `event.reqId`, then a generated uuid.
- **A dependency is undefined inside the processor** → confirm it was registered
  in `registerDependencies` (per-event), not assumed to be a cold-start singleton,
  and that for parallel handlers it resolves correctly inside the per-record
  child scope.
- **Config looks stale** → remember the 60s cache TTL on warm containers.

[Awilix]: https://github.com/jeffijoe/awilix
[AWS Config Executor]: https://github.com/pureskillgg/ace
[cache-manager]: https://www.npmjs.com/package/cache-manager
