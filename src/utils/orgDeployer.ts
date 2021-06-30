/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { EOL } from 'os';
import { cyan } from 'chalk';
import { Dictionary, Nullable, ensureString } from '@salesforce/ts-types';
import { Aliases, AuthInfo, Config, ConfigAggregator, NamedPackageDir } from '@salesforce/core';
import { Deployable, Deployer, Preferences, Options, generateTableChoices } from '@salesforce/plugin-project-utils';
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
  private username!: string;

  public constructor(private packages: NamedPackageDir[], protected options: Options) {
    super();
    this.deployables = this.packages.map((pkg) => new DeployablePackage(pkg, this));
  }

  public async setup(preferences: Preferences): Promise<Dictionary<string>> {
    if (preferences.interactive) {
      // Add this once we support test level
      // this.testLevel = await this.promptForTestLevel();
      this.username = await this.promptForUsername();
    }

    return { testLevel: this.testLevel, username: this.username };
  }

  public async deploy(): Promise<void> {
    const directories = this.deployables.map((d) => d.pkg.fullPath);
    const name = this.deployables.map((p) => cyan.bold(p.getAppName())).join(', ');
    this.log(`${EOL}Deploying ${name} to ${this.username}`);
    const componentSet = await ComponentSetBuilder.build({ directory: directories });
    const deploy = componentSet.deploy({
      usernameOrConnection: this.username,
    });

    const deployResult = await deploy.start();
    displayHumanReadableResults(deployResult?.getFileResponses() || []);
  }

  public async promptForUsername(): Promise<string> {
    const aliasOrUsername = ConfigAggregator.getValue(Config.DEFAULT_USERNAME)?.value as string;

    if (!aliasOrUsername) {
      const authroizations = await AuthInfo.listAllAuthorizations();
      const newestAuths = authroizations
        .filter((a) => !a.error)
        .sort((a, b) => new Date(ensureString(b.timestamp)).getTime() - new Date(ensureString(a.timestamp)).getTime());
      const options = newestAuths.map((auth) => ({
        name: auth.username,
        alias: auth.alias || '',
        value: auth.username,
      }));
      const columns = { name: 'Org', alias: 'Alias' };
      const { username } = await this.prompt<{ username: string }>([
        {
          name: 'username',
          message: 'Enter the target org for this deploy:',
          type: 'list',
          choices: generateTableChoices(columns, options),
        },
      ]);
      return (await Aliases.fetch(username)) || username;
    } else {
      return (await Aliases.fetch(aliasOrUsername)) || aliasOrUsername;
    }
  }

  public async promptForTestLevel(): Promise<string> {
    const { testLevel } = await this.prompt<{ testLevel: string }>([
      {
        name: 'testLevel',
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
    return testLevel;
  }
}
