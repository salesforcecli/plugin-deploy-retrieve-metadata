# plugin-deploy-retrieve-metadata;

[![NPM](https://img.shields.io/npm/v/@salesforce/plugin-deploy-retrieve-metadata.svg?label=@salesforce/plugin-deploy-retrieve-metadata)](https://www.npmjs.com/package/@salesforce/plugin-deploy-retrieve-metadata) [![CircleCI](https://circleci.com/gh/salesforcecli/plugin-deploy-retrieve-metadata/tree/main.svg?style=shield)](https://circleci.com/gh/salesforcecli/plugin-deploy-retrieve-metadata/tree/main) [![Downloads/week](https://img.shields.io/npm/dw/@salesforce/plugin-deploy-retrieve-metadata.svg)](https://npmjs.org/package/@salesforce/plugin-deploy-retrieve-metadata) [![License](https://img.shields.io/badge/License-BSD%203--Clause-brightgreen.svg)](https://raw.githubusercontent.com/salesforcecli/plugin-deploy-retrieve-metadata/main/LICENSE.txt)

## Learn about the plugin-deploy-retrieve-metadata

Salesforce CLI plugins are based on the [oclif plugin framework](<(https://oclif.io/docs/introduction.html)>). Read the [plugin developer guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_plugins.meta/sfdx_cli_plugins/cli_plugins_architecture_sf_cli.htm) to learn about Salesforce CLI plugin development.

This repository contains a lot of additional scripts and tools to help with general Salesforce node development and enforce coding standards. You should familiarize yourself with some of the [node developer packages](https://github.com/forcedotcom/sfdx-dev-packages/) used by Salesforce. There is also a default circleci config using the [release management orb](https://github.com/forcedotcom/npm-release-management-orb) standards.

Additionally, there are some additional tests that the Salesforce CLI will enforce if this plugin is ever bundled with the CLI. These test are included by default under the `posttest` script and it is recommended to keep these tests active in your plugin, regardless if you plan to have it bundled.

## Install

```bash
sf plugins:install deploy-retrieve-metadata@x.y.z
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
git clone git@github.com:salesforcecli/plugin-deploy-retrieve-metadata

# Install the dependencies and compile
yarn install
yarn build
```

To use your plugin, run using the local `./bin/dev` or `./bin/dev.cmd` file.

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
* [`sf deploy metadata`](#sf-deploy-metadata)
* [`sf retrieve metadata`](#sf-retrieve-metadata)

## `sf deploy metadata`

You must run this command from wihin a project.

```
USAGE
  $ sf deploy metadata [--json] [-m <value>] [-x <value>] [-d <value>] [--target-org <value>] [-l
    NoTestRun|RunSpecifiedTests|RunLocalTests|RunAllTestsInOrg] [--wait <value>]

FLAGS
  -d, --deploy-dir=<value>...  Root of local directory tree of files to deploy.

  -l, --test-level=<option>    [default: NoTestRun] Deployment Apex testing level.
                               <options: NoTestRun|RunSpecifiedTests|RunLocalTests|RunAllTestsInOrg>

  -m, --metadata=<value>...    List of metadata component names to deploy.

  -x, --manifest=<value>       Full file path for manifest (package.xml) of components to deploy.

  --target-org=<value>         Username or alias of the org you want to deploy to

  --wait=<value>               [default: 33] Number of minutes to wait for command to complete.

GLOBAL FLAGS
  --json  format output as json

DESCRIPTION
  Deploy source to an org.

  You must run this command from wihin a project.

  The source you deploy overwrites the corresponding metadata in your org. This command doesn’t attempt to merge your
  source with the versions in your org.

  If the comma-separated list you’re supplying contains spaces, enclose the entire comma-separated list in one set of
  double quotes. On Windows, if the list contains commas, also enclose the entire list in one set of double quotes.

EXAMPLES
  Deploy the source files in a directory:

    $ sf deploy metadata --deploy-dir path/to/source

  Deploy a specific Apex class and the objects whose source is in a directory:

    $ sf deploy metadata --deploy-dir "path/to/apex/classes/MyClass.cls,path/to/source/objects"

  Deploy source files in a comma-separated list that contains spaces:

    $ sf deploy metadata --deploy-dir "path/to/objects/MyCustomObject/fields/MyField.field-meta.xml, \
      path/to/apex/classes"

  Deploy all Apex classes:

    $ sf deploy metadata --metadata ApexClass

  Deploy a specific Apex class:

    $ sf deploy metadata --metadata ApexClass:MyApexClass

  Deploy all custom objects and Apex classes:

    $ sf deploy metadata --metadata "CustomObject,ApexClass"

  Deploy all Apex classes and two specific profiles (one of which has a space in its name):

    $ sf deploy metadata --metadata "ApexClass, Profile:My Profile, Profile: AnotherProfile"

  Deploy all components listed in a manifest:

    $ sf deploy metadata --manifest path/to/package.xml

FLAG DESCRIPTIONS
  -d, --deploy-dir=<value>...  Root of local directory tree of files to deploy.

    Root of local directory tree of files to deploy.

  -l, --test-level=NoTestRun|RunSpecifiedTests|RunLocalTests|RunAllTestsInOrg  Deployment Apex testing level.

    Deployment Apex testing level.

  -m, --metadata=<value>...  List of metadata component names to deploy.

    List of metadata component names to deploy.

  -x, --manifest=<value>  Full file path for manifest (package.xml) of components to deploy.

    Full file path for manifest (package.xml) of components to deploy.

  --wait=<value>  Number of minutes to wait for command to complete.

    Default is 33 minutes.
```

## `sf retrieve metadata`

The source you retrieve overwrites the corresponding source files in your local project . This command doesn’t attempt to merge the source from your org with your local source files. If the command detects a conflict, it displays the conflicts but doesn’t complete the process. After reviewing the conflict, rerun the command with the --force-overwrite flag to overwrite your local files.

```
USAGE
  $ sf retrieve metadata [--json] [-a <value>] [-x <value> | -m <value> | -d <value>] [-n <value>] [-t <value>] [-w
    <value>]

FLAGS
  -a, --api-version=<value>      target API version for the retrieve
  -d, --source-dir=<value>...    source dir to use instead of the default package dir in sfdx-project.json
  -m, --metadata=<value>...      comma-separated list of metadata component names
  -n, --package-name=<value>...  a comma-separated list of packages to retrieve
  -t, --target-org=<value>       Username or alias of the org you want to retrieve from
  -w, --wait=<value>             [default: 33] wait time for command to finish in minutes
  -x, --manifest=<value>         file path for manifest (package.xml) of components to deploy

GLOBAL FLAGS
  --json  format output as json

DESCRIPTION
  Retrieve source from an org.

  The source you retrieve overwrites the corresponding source files in your local project . This command doesn’t attempt
  to merge the source from your org with your local source files. If the command detects a conflict, it displays the
  conflicts but doesn’t complete the process. After reviewing the conflict, rerun the command with the --force-overwrite
  flag to overwrite your local files.

  If the comma-separated list you’re supplying contains spaces, enclose the entire comma-separated list in one set of
  double quotes. On Windows, if the list contains commas, also enclose the entire list in one set of double quotes.

  You must run this command from wihin a project.

EXAMPLES
  Retrieve the source files in a directory:

    $ sf project retrieve org --source-path path/to/source

  Retrieve a specific Apex class and the objects whose source is in a directory:

    $ sf project retrieve org --source-path "path/to/apex/classes/MyClass.cls,path/to/source/objects"

  Retrieve source files in a comma-separated list that contains spaces:

    $ sf project retrieve org --source-path "path/to/objects/MyCustomObject/fields/MyField.field-meta.xml, \
      path/to/apex/classes"

  Retrieve all Apex classes:

    $ sf project retrieve org --metadata ApexClass

  Retrieve a specific Apex class:

    $ sf project retrieve org --metadata ApexClass:MyApexClass

  Retrieve all custom objects and Apex classes:

    $ sf project retrieve org --metadata "CustomObject,ApexClass"

  Retrieve all metadata components listed in a manifest:

    $ sf project retrieve org --manifest path/to/package.xml

  Retrieve metadata from a package:

    $ sf project retrieve org --package-names MyPackageName

  Retrieve metadata from multiple packages:

    $ sf project retrieve org --package-names "Package1, PackageName With Spaces, Package3"
```
<!-- commandsstop -->
