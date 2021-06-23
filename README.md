# plugin-project-org;

[![NPM](https://img.shields.io/npm/v/@salesforce/plugin-project-org.svg?label=@salesforce/plugin-project-org)](https://www.npmjs.com/package/@salesforce/plugin-project-org) [![CircleCI](https://circleci.com/gh/salesforcecli/plugin-project-org/tree/main.svg?style=shield)](https://circleci.com/gh/salesforcecli/plugin-project-org/tree/main) [![Downloads/week](https://img.shields.io/npm/dw/@salesforce/plugin-project-org.svg)](https://npmjs.org/package/@salesforce/plugin-project-org) [![License](https://img.shields.io/badge/License-BSD%203--Clause-brightgreen.svg)](https://raw.githubusercontent.com/salesforcecli/plugin-project-org/main/LICENSE.txt)

## Learn about the plugin-project-org

Salesforce CLI plugins are based on the [oclif plugin framework](<(https://oclif.io/docs/introduction.html)>). Read the [plugin developer guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_plugins.meta/sfdx_cli_plugins/cli_plugins_architecture_sf_cli.htm) to learn about Salesforce CLI plugin development.

This repository contains a lot of additional scripts and tools to help with general Salesforce node development and enforce coding standards. You should familiarize yourself with some of the [node developer packages](https://github.com/forcedotcom/sfdx-dev-packages/) used by Salesforce. There is also a default circleci config using the [release management orb](https://github.com/forcedotcom/npm-release-management-orb) standards.

Additionally, there are some additional tests that the Salesforce CLI will enforce if this plugin is ever bundled with the CLI. These test are included by default under the `posttest` script and it is recommended to keep these tests active in your plugin, regardless if you plan to have it bundled.

## Install

```bash
sf plugins:install project-org@x.y.z
```

## Issues

Please report any issues at https://github.com/forcedotcom/cli/issues

## Contributing

1. Please read our [Code of Conduct](CODE_OF_CONDUCT.md)
2. Create a new issue before starting your project so that we can keep track of
   what you are trying to add/fix. That way, we can also offer suggestions or
   let you know if there is already an effort in progress.
3. Fork this repository.
4. [Build the plugin locally](#build)
5. Create a _topic_ branch in your fork. Note, this step is recommended but technically not required if contributing using a fork.
6. Edit the code in your fork.
7. Write appropriate tests for your changes. Try to achieve at least 95% code coverage on any new code. No pull request will be accepted without unit tests.
8. Sign CLA (see [CLA](#cla) below).
9. Send us a pull request when you are done. We'll review your code, suggest any needed changes, and merge it in.

### CLA

External contributors will be required to sign a Contributor's License
Agreement. You can do so by going to https://cla.salesforce.com/sign-cla.

### Build

To build the plugin locally, make sure to have yarn installed and run the following commands:

```bash
# Clone the repository
git clone git@github.com:salesforcecli/plugin-project-org

# Install the dependencies and compile
yarn install
yarn build
```

To use your plugin, run using the local `./bin/run` or `./bin/run.cmd` file.

```bash
# Run using local run file.
./bin/run --help
```

There should be no differences when running via the Salesforce CLI or using the local run file. However, it can be useful to link the plugin to do some additional testing or run your commands from anywhere on your machine.

```bash
# Link your plugin to the sfdx cli
sf plugins:link .
# To verify
sf plugins
```

## Commands

<!-- commands -->
* [`sf project:deploy:org`](#sf-projectdeployorg)

## `sf project:deploy:org`

deploy source to a salesforce org

```
USAGE
  $ sf project:deploy:org

OPTIONS
  -d, --directory=directory    list of paths to the local source files to deploy
  -e, --target-org=target-org  org environment you want to deploy to
  -m, --metadata=metadata      list of metadata component names
  -x, --manifest=manifest      file path for manifest (package.xml) of components to deploy
  --json                       json output

EXAMPLES
  sf project deploy org --metadata ApexClass
  sf project deploy org --manifest package.xml
  sf project deploy org --directory force-app
```

_See code: [src/commands/project/deploy/org.ts](https://github.com/salesforcecli/plugin-project-org/blob/v0.0.1/src/commands/project/deploy/org.ts)_
<!-- commandsstop -->
