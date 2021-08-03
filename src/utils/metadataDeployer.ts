/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { EOL } from 'os';
import { cyan } from 'chalk';
import { Nullable, ensureString } from '@salesforce/ts-types';
import { Duration } from '@salesforce/kit';
import { AuthInfo, ConfigAggregator, GlobalInfo, NamedPackageDir, OrgConfigProperties, SfOrgs } from '@salesforce/core';
import {
  Deployable,
  Deployer,
  Preferences,
  DeployerOptions,
  generateTableChoices,
} from '@salesforce/plugin-deploy-retrieve-utils';
import { ComponentSetBuilder } from './componentSetBuilder';
import { displayFailures, displaySuccesses, displayTestResults } from './output';
import { TestLevel } from './testLevel';
import { DeployProgress } from './progressBar';
import { resolveRestDeploy } from './config';

export interface MetadataDeployOptions extends DeployerOptions {
  testLevel?: TestLevel;
  username?: string;
  directories?: string[];
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

export class MetadataDeployer extends Deployer {
  public static NAME = 'Salesforce Apps';

  public deployables: DeployablePackage[];
  private testLevel = TestLevel.NoTestRun;
  private username!: string;

  public constructor(private packages: NamedPackageDir[]) {
    super();
    this.deployables = this.packages.map((pkg) => new DeployablePackage(pkg, this));
  }

  public getName(): string {
    return MetadataDeployer.NAME;
  }

  public async setup(preferences: Preferences, options: MetadataDeployOptions): Promise<MetadataDeployOptions> {
    if (preferences.interactive) {
      this.testLevel = await this.promptForTestLevel();
      this.username = await this.promptForUsername();
    } else {
      if (options.directories?.length) {
        const directories = options.directories || [];
        const selected = this.deployables.filter((d) => directories.includes(d.getAppPath()));
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
    this.log(`${EOL}Deploying ${name} to ${this.username} using ${resolveRestDeploy()} API`);
    const componentSet = await ComponentSetBuilder.build({ directory: directories });
    const deploy = await componentSet.deploy({
      usernameOrConnection: this.username,
      apiOptions: { testLevel: this.testLevel },
    });

    new DeployProgress(deploy).start();

    const result = await deploy.pollStatus(500, Duration.minutes(33).seconds);
    displaySuccesses(result);
    displayFailures(result);
    displayTestResults(result);
  }

  public async promptForUsername(): Promise<string> {
    const aliasOrUsername = ConfigAggregator.getValue(OrgConfigProperties.TARGET_ORG)?.value as string;
    const globalInfo = await GlobalInfo.getInstance();
    const allAliases = globalInfo.aliases.getAll();
    globalInfo.aliases.resolveUsername(aliasOrUsername);
    if (!aliasOrUsername) {
      const orgs: SfOrgs = globalInfo.orgs.getAll();
      const authorizations = await AuthInfo.listAllAuthorizations();
      const newestAuths = authorizations
        .filter((a) => !a.error)
        .sort((a, b) => {
          const aTimestamp = orgs[a.username].timestamp;
          const bTimestamp = orgs[b.username].timestamp;
          return new Date(ensureString(bTimestamp)).getTime() - new Date(ensureString(aTimestamp)).getTime();
        });
      const options = newestAuths.map((auth) => ({
        name: auth.username,
        aliases: Object.entries(allAliases)
          .filter(([, usernameOrAlias]) => usernameOrAlias === auth.username)
          .map(([alias]) => alias)
          .join(', '),
        value: auth.username,
      }));
      const columns = { name: 'Org', aliases: 'Aliases' };
      const { username } = await this.prompt<{ username: string }>([
        {
          name: 'username',
          message: 'Select the org you want to deploy to:',
          type: 'list',
          choices: generateTableChoices(columns, options),
        },
      ]);
      return username;
    } else {
      return globalInfo.aliases.resolveUsername(aliasOrUsername);
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
          { name: "Don't run tests", value: TestLevel.NoTestRun, short: "Don't run tests" },
          { name: 'Run local tests', value: TestLevel.RunLocalTests, short: 'Run local tests' },
          {
            name: 'Run all tests in environment',
            value: TestLevel.RunAllTestsInOrg,
            short: 'Run all tests in environment',
          },
        ],
      },
    ]);
    return testLevel as TestLevel;
  }
}
