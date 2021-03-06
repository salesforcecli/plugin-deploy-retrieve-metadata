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

- [`sf deploy metadata`](#sf-deploy-metadata)
- [`sf retrieve metadata`](#sf-retrieve-metadata)

## `sf deploy metadata`

Deploy metadata in source format to an org from your local project.

```
USAGE
  $ sf deploy metadata [--json] [-m <value> | -x <value> | -d <value>] [-o <value>] [-l
    NoTestRun|RunSpecifiedTests|RunLocalTests|RunAllTestsInOrg] [-w <value>]

FLAGS
  -d, --source-dir=<value>...  Path to the local source files to deploy.
  -l, --test-level=<option>    [default: NoTestRun] Deployment Apex testing level.
                               <options: NoTestRun|RunSpecifiedTests|RunLocalTests|RunAllTestsInOrg>
  -m, --metadata=<value>...    Metadata component names to deploy.
  -o, --target-org=<value>     Login username or alias for the target org.
  -w, --wait=<value>           [default: 33] Number of minutes to wait for command to complete and display results.
  -x, --manifest=<value>       Full file path for manifest (package.xml) of components to deploy.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Deploy metadata in source format to an org from your local project.

  You must run this command from within a project.

  This command doesn't support source-tracking. The source you deploy overwrites the corresponding metadata in your org.
  This command doesn???t attempt to merge your source with the versions in your org.

  To run the command asynchronously, set --wait to 0, which immediately returns the job ID. This way, you can continue
  to use the CLI.

  To deploy multiple metadata components, either set multiple --metadata <name> flags or a single --metadata flag with
  multiple names separated by spaces. Enclose names that contain spaces in one set of double quotes. The same syntax
  applies to --manifest and --source-dir.

EXAMPLES
  Deploy the source files in a directory:

    $ sf deploy metadata  --source-dir path/to/source

  Deploy a specific Apex class and the objects whose source is in a directory (both examples are equivalent):

    $ sf deploy metadata --source-dir path/to/apex/classes/MyClass.cls path/to/source/objects
    $ sf deploy metadata --source-dir path/to/apex/classes/MyClass.cls --source-dir path/to/source/objects

  Deploy all Apex classes:

    $ sf deploy metadata --metadata ApexClass

  Deploy a specific Apex class:

    $ sf deploy metadata --metadata ApexClass:MyApexClass

  Deploy all custom objects and Apex classes (both examples are equivalent):

    $ sf deploy metadata --metadata CustomObject ApexClass
    $ sf deploy metadata --metadata CustomObject --metadata ApexClass

  Deploy all Apex classes and a profile that has a space in its name:

    $ sf deploy metadata --metadata ApexClass --metadata "Profile:My Profile"

  Deploy all components listed in a manifest:

    $ sf deploy metadata --manifest path/to/package.xml

  Run the tests that aren???t in any managed packages as part of a deployment:

    $ sf deploy metadata --metadata ApexClass --test-level RunLocalTests

FLAG DESCRIPTIONS
  -d, --source-dir=<value>...  Path to the local source files to deploy.

    The supplied path can be to a single file (in which case the operation is applied to only one file) or to a folder
    (in which case the operation is applied to all metadata types in the directory and its subdirectories).

    If you specify this flag, don???t specify --metadata or --manifest.

  -l, --test-level=NoTestRun|RunSpecifiedTests|RunLocalTests|RunAllTestsInOrg  Deployment Apex testing level.

    Valid values are:

    - NoTestRun ??? No tests are run. This test level applies only to deployments to development environments, such as
    sandbox, Developer Edition, or trial orgs. This test level is the default for development environments.

    - RunSpecifiedTests ??? Runs only the tests that you specify with the --run-tests flag. Code coverage requirements
    differ from the default coverage requirements when using this test level. Executed tests must comprise a minimum of
    75% code coverage for each class and trigger in the deployment package. This coverage is computed for each class and
    trigger individually and is different than the overall coverage percentage.

    - RunLocalTests ??? All tests in your org are run, except the ones that originate from installed managed and unlocked
    packages. This test level is the default for production deployments that include Apex classes or triggers.

    - RunAllTestsInOrg ??? All tests in your org are run, including tests of managed packages.

    If you don???t specify a test level, the default behavior depends on the contents of your deployment package. For more
    information, see [Running Tests in a
    Deployment](https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_deploy_running_tests.htm)
    in the "Metadata API Developer Guide".

  -o, --target-org=<value>  Login username or alias for the target org.

    Overrides your default org.

  -w, --wait=<value>  Number of minutes to wait for command to complete and display results.

    If the command continues to run after the wait period, the CLI returns control of the terminal window to you.

  -x, --manifest=<value>  Full file path for manifest (package.xml) of components to deploy.

    All child components are included. If you specify this flag, don???t specify --metadata or --source-dir.
```

## `sf retrieve metadata`

Retrieve metadata in source format from an org to your local project.

```
USAGE
  $ sf retrieve metadata [--json] [-a <value>] [-x <value> | -m <value> | -d <value>] [-n <value>] [-o <value>] [-w
    <value>]

FLAGS
  -a, --api-version=<value>      Target API version for the retrieve.
  -d, --source-dir=<value>...    File paths for source to retrieve from the org.
  -m, --metadata=<value>...      Metadata component names to retrieve.
  -n, --package-name=<value>...  Package names to retrieve.
  -o, --target-org=<value>       Login username or alias for the target org.
  -w, --wait=<value>             [default: 33] Number of minutes to wait for the command to complete and display results
                                 to the terminal window.
  -x, --manifest=<value>         File path for the manifest (package.xml) that specifies the components to retrieve.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Retrieve metadata in source format from an org to your local project.

  You must run this command from within a project.

  This command doesn't support source-tracking. The source you retrieve overwrites the corresponding source files in
  your local project. This command doesn???t attempt to merge the source from your org with your local source files.

  To retrieve multiple metadata components, either use multiple --metadata <name> flags or use a single --metadata flag
  with multiple names separated by spaces. Enclose names that contain spaces in one set of double quotes. The same
  syntax applies to --manifest and --source-dir.

EXAMPLES
  Retrieve the source files in a directory:

    $ sf retrieve metadata --source-dir path/to/source

  Retrieve a specific Apex class and the objects whose source is in a directory (both examples are equivalent):

    $ sf retrieve metadata --source-dir path/to/apex/classes/MyClass.cls path/to/source/objects
    $ sf retrieve metadata --source-dir path/to/apex/classes/MyClass.cls --source-dir path/to/source/objects

  Retrieve all Apex classes:

    $ sf retrieve metadata --metadata ApexClass

  Retrieve a specific Apex class:

    $ sf retrieve metadata --metadata ApexClass:MyApexClass

  Retrieve all custom objects and Apex classes (both examples are equivalent):

    $ sf retrieve metadata --metadata CustomObject ApexClass
    $ sf retrieve metadata --metadata CustomObject --metadata ApexClass

  Retrieve all metadata components listed in a manifest:

    $ sf retrieve metadata --manifest path/to/package.xml

  Retrieve metadata from a package:

    $ sf retrieve metadata --package-name MyPackageName

  Retrieve metadata from multiple packages, one of which has a space in its name (both examples are equivalent):

    $ sf retrieve metadata --package-name Package1 "PackageName With Spaces" Package3
    $ sf retrieve metadata --package-name Package1 --package-name "PackageName With Spaces" --package-name Package3

FLAG DESCRIPTIONS
  -a, --api-version=<value>  Target API version for the retrieve.

    Use this flag to override the default API version, which is the latest version supported the CLI, with the API
    version in your package.xml file.

  -d, --source-dir=<value>...  File paths for source to retrieve from the org.

    The supplied paths can be to a single file (in which case the operation is applied to only one file) or to a folder
    (in which case the operation is applied to all source files in the directory and its subdirectories).

  -o, --target-org=<value>  Login username or alias for the target org.

    Overrides your default org.

  -w, --wait=<value>  Number of minutes to wait for the command to complete and display results to the terminal window.

    If the command continues to run after the wait period, the CLI returns control of the terminal window to you.

  -x, --manifest=<value>  File path for the manifest (package.xml) that specifies the components to retrieve.

    If you specify this parameter, don???t specify --metadata or --source-dir.
```

<!-- commandsstop -->
