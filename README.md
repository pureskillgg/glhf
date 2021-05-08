# Good Lambda Have Function

[![GitHub Actions](https://github.com/pureskillgg/glhf/workflows/main/badge.svg)](https://github.com/pureskillgg/glhf/actions)

Code Lambda for fun and profit.

## Description

Create a basic handler with

```js
import { invokeHandler } from '@pureskillgg/glhf'

const createProcessor = () => async (event, container) => {
  return { hello: 'world' }
}

export const handler = createHandleInvoke()
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

Ensure a `GITHUB_TOKEN` is set in your environment and
use `yarn run release:<environment>` to do this automatically, e.g.,

```
$ yarn run release:staging
$ yarn run release:production
```

Deployment may be triggered using on the web
using a [release workflow_dispatch on GitHub Actions].

[npm-version]: https://docs.npmjs.com/cli/version
[release workflow_dispatch on GitHub Actions]: https://github.com/pureskillgg/glhf/actions?query=workflow%3Arelease

## GitHub Actions

_GitHub Actions should already be configured: this section is for reference only._

The following repository secrets must be set on [GitHub Actions]:

- `AWS_DEFAULT_REGION`: The AWS region Serverless will deploy to.
- `AWS_ACCESS_KEY_ID`: AWS access key ID.
- `AWS_SECRET_ACCESS_KEY`: AWS secret access key.
- `GH_TOKEN`: A personal access token that can trigger workflows
  and read and write packages.
- `GRAFANA_API_ORIGIN`: The Grafana origin to push annotations.
- `GRAFANA_API_KEY`: The Grafana key key for pushing annotations.
- `DISCORD_WEBHOOK`: The Discord webhook to notify on deploy.

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

This Serverless project is Copyright (c) 2019-2021 FPS Critic, Inc.

Portions of code in this Serverless project were taken and adapted from
[@meltwater/jackalambda] which is licensed under the
[included MIT license][./MIT-LICENSE.txt].
The derived code is Copyright (c) 2019-2021 FPS Critic, Inc.

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
