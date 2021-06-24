/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { EOL } from 'os';
import { cyan } from 'chalk';
import { Answers, prompt } from 'inquirer';
import { Dictionary, Nullable, ensureString } from '@salesforce/ts-types';
import { NamedPackageDir } from '@salesforce/core';
import { Deployer, Preferences, Options } from '@salesforce/plugin-project-utils';
import { ComponentSetBuilder } from '../utils/componentSetBuilder';
import { displayHumanReadableResults } from '../utils/tableBuilder';

export class OrgDeployer extends Deployer {
  private testLevel = 'none';

  public constructor(private pkg: NamedPackageDir, protected options: Options) {
    super();
  }

  public getAppName(): string {
    return this.pkg.name;
  }

  public getAppType(): string {
    return 'org';
  }

  public getAppPath(): string {
    return this.pkg.path;
  }

  public getEnvType(): Nullable<string> {
    return null;
  }

  public get package(): NamedPackageDir {
    return this.pkg;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async setup(preferences: Preferences): Promise<Dictionary<string>> {
    if (preferences.interactive) {
      // Add this once we support test level
      // this.testLevel = await this.promptForTestLevel();
    }

    return { testLevel: this.testLevel };
  }

  public async deploy(): Promise<void> {
    this.log(`${EOL}Deploying ${cyan.bold(this.getAppName())} to ${this.options.username}`);
    const componentSet = await ComponentSetBuilder.build({ directory: [this.pkg.fullPath] });
    const deploy = componentSet.deploy({
      usernameOrConnection: this.options.username,
    });

    const deployResult = await deploy.start();
    displayHumanReadableResults(deployResult?.getFileResponses() || []);
  }

  public async promptForTestLevel(): Promise<string> {
    const { tests } = await prompt<Answers>([
      {
        name: 'tests',
        message: 'Select the test level you would like to run for ' + cyan.bold(this.pkg.name) + ':',
        type: 'list',
        loop: false,
        pageSize: 4,
        choices: [
          { name: 'Run local tests', value: 'local', short: 'Run local tests' },
          { name: 'Run specified tests', value: 'specified', short: 'Run specified tests' },
          { name: 'Run all tests in environment', value: 'all', short: 'Run all tests in environment' },
          { name: "Don't run tests", value: 'none', short: "Don't run tests" },
        ],
      },
    ]);
    return ensureString(tests);
  }
}

export class MergedOrgDeployer extends OrgDeployer {
  private packages: NamedPackageDir[];

  public constructor(deployers: OrgDeployer[], options: Options) {
    super({} as NamedPackageDir, options);
    this.packages = deployers.map((d) => d.package);
  }

  public async deploy(): Promise<void> {
    const appName = this.packages.map((p) => cyan.bold(p.name)).join(', ');
    this.log(`${EOL}Deploying ${appName} to ${this.options.username}`);
    const componentSet = await ComponentSetBuilder.build({ directory: this.packages.map((p) => p.fullPath) });
    const deploy = componentSet.deploy({
      usernameOrConnection: this.options.username,
    });

    const deployResult = await deploy.start();
    displayHumanReadableResults(deployResult?.getFileResponses() || []);
  }
}
