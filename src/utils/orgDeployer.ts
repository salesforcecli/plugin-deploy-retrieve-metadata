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
import { Deployable, Deployer, Preferences, Options } from '@salesforce/plugin-project-utils';
import { ComponentSetBuilder } from '../utils/componentSetBuilder';
import { displayHumanReadableResults } from '../utils/tableBuilder';

export class DeployablePackage extends Deployable {
  public constructor(public pkg: NamedPackageDir, private parent: Deployer) {
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

  public getParent(): Deployer {
    return this.parent;
  }
}

export class OrgDeployer extends Deployer {
  public deployables: DeployablePackage[];
  private testLevel = 'none';

  public constructor(private packages: NamedPackageDir[], protected options: Options) {
    super();
    this.deployables = this.packages.map((pkg) => new DeployablePackage(pkg, this));
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
    const directories = this.deployables.map((d) => d.pkg.fullPath);
    const name = this.deployables.map((p) => cyan.bold(p.getAppName())).join(', ');
    this.log(`${EOL}Deploying ${name} to ${this.options.username}`);
    const componentSet = await ComponentSetBuilder.build({ directory: directories });
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
        message: 'Select the test level you would like to run:',
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
