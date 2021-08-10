/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { EOL } from 'os';
import { cyan } from 'chalk';
import { Nullable } from '@salesforce/ts-types';
import { Duration } from '@salesforce/kit';
import {
  AuthInfo,
  ConfigAggregator,
  GlobalInfo,
  Messages,
  NamedPackageDir,
  OrgAuthorization,
  OrgConfigProperties,
} from '@salesforce/core';
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

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-deploy-retrieve-metadata', 'deploy.metadata');

const compareOrgs = (a: OrgAuthorization, b: OrgAuthorization): number => {
  // scratch orgs before other orgs
  if (a.isScratchOrg && !b.isScratchOrg) {
    // all scratch orgs come before non-scratch orgs
    return -1;
  } else {
    // dev hubs after scratch but before remaining orgs
    if (b.isScratchOrg) {
      return 1;
    }
    if (a.isDevHub && !b.isScratchOrg && !b.isDevHub) {
      return -1;
    }
    // not a scratch org and not a devhub means "other" sorts last
    if (!a.isDevHub) {
      return 1;
    }
  }
  // orgs are equal by type - sort by name ascending
  if (a.username < b.username) {
    return -1;
  }
  if (a.username > b.username) {
    return 1;
  }
  return 0;
};

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
    displayTestResults(result, this.testLevel);
  }

  public async promptForUsername(): Promise<string> {
    const aliasOrUsername = ConfigAggregator.getValue(OrgConfigProperties.TARGET_ORG)?.value as string;
    const globalInfo = await GlobalInfo.getInstance();
    const allAliases = globalInfo.aliases.getAll();

    if (!aliasOrUsername) {
      const authorizations = await AuthInfo.listAllAuthorizations(
        (orgAuth) => !orgAuth.error && (orgAuth.isDevHub || !orgAuth.isExpired || orgAuth.isExpired === 'unknown')
      );
      if (authorizations.length > 0) {
        const newestAuths = authorizations.sort(compareOrgs);
        const options = newestAuths.map((auth) => ({
          name: auth.username,
          aliases: Object.entries(allAliases)
            .filter(([, usernameOrAlias]) => usernameOrAlias === auth.username)
            .map(([alias]) => alias)
            .join(', '),
          isScratchOrg: auth.isScratchOrg ? 'Yes' : 'No',
          value: auth.username,
        }));
        const columns = { name: 'Org', aliases: 'Aliases', isScratchOrg: 'Scratch Org' };
        const { username } = await this.prompt<{ username: string }>([
          {
            name: 'username',
            message: 'Select the org you want to deploy to:',
            type: 'list',
            choices: generateTableChoices(columns, options, false),
          },
        ]);
        return username;
      } else {
        throw messages.createError('errors.NoOrgsToSelect');
      }
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
