# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/)
and this project adheres to [Semantic Versioning](https://semver.org/).

## 2.3.0 / 2022-02-25

### Changed

- Update dependencies.

## 2.2.1 / 2021-12-21

### Added

- More docs for EventBridge handler.

## 2.2.0 / 2021-12-21

### Changed

- Release under the MIT license.

### 2.1.1 / 2021-12-11

### Fixed

- Missing exports.

### 2.1.0 / 2021-12-11

### Added

- EventBridge parser and handler.

### 2.0.1 / 2021-11-23

### Changed

- Update dependencies.

### 2.0.0 / 2021-08-30

### Changed

- Update to Awilix v5.

### 1.5.1 / 2021-08-30

### Fixed

- Handle non-error objects with Boom.

### 1.5.0 / 2021-08-01

### Changed

- Log warning on HTTP error response.

### 1.4.0 / 2021-08-01

### Changed

- Awilix container is now persisted per-handler and scoped per-invocation.

### 1.3.0 / 2021-07-30

### Added

- HTTP `securityHeaders`.

### 1.2.2 / 2021-07-29

### Fixed

- Remove await keyword in handler (was not actually missing).

### 1.2.1 / 2021-07-29

### Fixed

- Missing await keyword in handler.

### 1.2.0 / 2021-07-16

### Added

- HTTP handlers.
- Handle request id for unparsed SQS event case.
- Call `onError` in strategies if registered as a dependency.

### Changed

- Invoke wrapper log name from `default` to `invoke`.

## 1.1.1 / 2021-07-14

### Fixed

- Parallel strategy did not pass record context.

## 1.1.0 / 2021-07-13

### Added

- SQS handlers.
- Wrapper for record processing.
- Stratagry for parallel processing.
- Export `EventType` enum.
- Export wrappers.
- Export strategies.
- Documentation to README.

### Fixed

- Passing `context` instead of `ctx` to processor.

### Changed

- Signature for `createWrapper` (was interal before this version).

## 1.0.5 / 2021-05-14

### Fixed

- Sentry release format.

## 1.0.4 / 2021-05-13

### Fixed

- Sentry release format.

## 1.0.3 / 2021-05-12

### Fixed

- Sentry release version.

## 1.0.2 / 2021-05-12

### Changed

- Update dependencies.

## 1.0.1 / 2021-05-11

### Removed

- Unused @pureskillgg/awsjs dependency.

## 1.0.0 / 2021-05-09

- Initial release.
