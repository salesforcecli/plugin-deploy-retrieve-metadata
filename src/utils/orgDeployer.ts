/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { EOL } from 'os';
import { cyan } from 'chalk';
import { Nullable, ensureString } from '@salesforce/ts-types';
import { Aliases, AuthInfo, Config, ConfigAggregator, NamedPackageDir } from '@salesforce/core';
import {
  Deployable,
  Deployer,
  Preferences,
  DeployerOptions,
  generateTableChoices,
} from '@salesforce/plugin-project-utils';
import { ComponentSetBuilder } from '../utils/componentSetBuilder';
import { displayHumanReadableResults } from '../utils/tableBuilder';
import { TestLevel } from '../utils/testLevel';

export interface OrgDeployOptions extends DeployerOptions {
  testLevel?: TestLevel;
  username?: string;
  apps?: string[];
}

export class DeployablePackage extends Deployable {
  public constructor(public pkg: NamedPackageDir, private parent: Deployer) {
    super();
  }

  public getAppName(): string {
    return this.pkg.name;
  }

  public getAppType(): string {
    return 'Salesforce App';
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
  public static NAME = 'Salesforce Apps';

  public deployables: DeployablePackage[];
  private testLevel = TestLevel.NoTestRun;
  private username!: string;

  public constructor(private packages: NamedPackageDir[]) {
    super();
    this.deployables = this.packages.map((pkg) => new DeployablePackage(pkg, this));
  }

  public getName(): string {
    return OrgDeployer.NAME;
  }

  public async setup(preferences: Preferences, options: OrgDeployOptions): Promise<OrgDeployOptions> {
    if (preferences.interactive) {
      this.testLevel = await this.promptForTestLevel();
      this.username = await this.promptForUsername();
    } else {
      if (options.apps?.length) {
        const apps = options.apps || [];
        const selected = this.deployables.filter((d) => apps.includes(d.getAppPath()));
        this.selectDeployables(selected);
      }
      this.testLevel = options.testLevel || (await this.promptForTestLevel());
      this.username = options.username || (await this.promptForUsername());
    }

    return {
      testLevel: this.testLevel,
      username: this.username,
      apps: this.deployables.map((d) => d.getAppPath()),
    };
  }

  public async deploy(): Promise<void> {
    const directories = this.deployables.map((d) => d.pkg.fullPath);
    const name = this.deployables.map((p) => cyan.bold(p.getAppName())).join(', ');
    this.log(`${EOL}Deploying ${name} to ${this.username}`);
    const componentSet = await ComponentSetBuilder.build({ directory: directories });
    const deploy = await componentSet.deploy({
      usernameOrConnection: this.username,
      apiOptions: { testLevel: this.testLevel },
    });

    const deployResult = await deploy.pollStatus(500);
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
          message: 'Select the org you want to deploy to:',
          type: 'list',
          choices: generateTableChoices(columns, options),
        },
      ]);
      return (await Aliases.fetch(username)) || username;
    } else {
      return (await Aliases.fetch(aliasOrUsername)) || aliasOrUsername;
    }
  }

  public async promptForTestLevel(): Promise<TestLevel> {
    const { testLevel } = await this.prompt<{ testLevel: string }>([
      {
        name: 'testLevel',
        message: 'Select the test level you would like to run:',
        type: 'list',
        loop: false,
        pageSize: 4,
        choices: [
          { name: 'Run local tests', value: TestLevel.RunLocalTests, short: 'Run local tests' },
          { name: 'Run specified tests', value: TestLevel.RunSpecifiedTests, short: 'Run specified tests' },
          {
            name: 'Run all tests in environment',
            value: TestLevel.RunAllTestsInOrg,
            short: 'Run all tests in environment',
          },
          { name: "Don't run tests", value: TestLevel.NoTestRun, short: "Don't run tests" },
        ],
      },
    ]);
    return testLevel as TestLevel;
  }
}
