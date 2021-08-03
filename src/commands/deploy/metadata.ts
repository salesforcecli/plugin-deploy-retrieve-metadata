/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { EOL } from 'os';
import { Command, Flags } from '@oclif/core';
import { Messages } from '@salesforce/core';
import { Duration } from '@salesforce/kit';
import { getNumber, getString } from '@salesforce/ts-types';
import { DeployResult, FileResponse } from '@salesforce/source-deploy-retrieve';
import { RequestStatus } from '@salesforce/source-deploy-retrieve/lib/src/client/types';
import { getPackageDirs, resolveTargetOrg } from '../../utils/orgs';
import { ComponentSetBuilder, ManifestOption } from '../../utils/componentSetBuilder';
import { asRelativePaths, displayFailures, displaySuccesses, displayTestResults } from '../../utils/output';
import { TestLevel } from '../../utils/testLevel';
import { DeployProgress } from '../../utils/progressBar';
import { resolveRestDeploy } from '../../utils/config';
import { validateOneOfCommandFlags } from '../../utils/requiredFlagValidator';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-deploy-retrieve-metadata', 'deploy.metadata');

// One of these flags must be specified for a valid deploy.
const requiredFlags = ['manifest', 'metadata', 'source-dir'];

export type TestResults = {
  passing: number;
  failing: number;
  total: number;
  time?: number;
};

export type DeployMetadataResult = {
  files: FileResponse[];
  tests?: TestResults;
};

export default class DeployMetadata extends Command {
  public static readonly description = messages.getMessage('description');
  public static readonly summary = messages.getMessage('summary');
  public static readonly examples = messages.getMessages('examples');
  public static flags = {
    metadata: Flags.string({
      char: 'm',
      summary: messages.getMessage('flags.metadata.summary'),
      multiple: true,
      exclusive: ['manifest', 'source-dir'],
    }),
    manifest: Flags.string({
      char: 'x',
      description: messages.getMessage('flags.manifest.description'),
      summary: messages.getMessage('flags.manifest.summary'),
      exclusive: ['metadata', 'source-dir'],
    }),
    'source-dir': Flags.string({
      char: 'd',
      description: messages.getMessage('flags.source-dir.description'),
      summary: messages.getMessage('flags.source-dir.summary'),
      multiple: true,
      exclusive: ['manifest', 'metadata'],
    }),
    'target-org': Flags.string({
      char: 'o',
      description: messages.getMessage('flags.target-org.description'),
      summary: messages.getMessage('flags.target-org.summary'),
    }),
    'test-level': Flags.string({
      char: 'l',
      description: messages.getMessage('flags.test-level.description'),
      summary: messages.getMessage('flags.test-level.summary'),
      options: Object.values(TestLevel),
      default: TestLevel.NoTestRun,
    }),
    wait: Flags.integer({
      char: 'w',
      summary: messages.getMessage('flags.wait.summary'),
      description: messages.getMessage('flags.wait.description'),
      default: 33,
    }),
  };

  public async run(): Promise<DeployMetadataResult> {
    const flags = (await this.parse(DeployMetadata)).flags;

    validateOneOfCommandFlags(requiredFlags, flags);

    const componentSet = await ComponentSetBuilder.build({
      directory: flags['source-dir'],
      manifest: (flags.manifest && {
        manifestPath: flags.manifest,
        directoryPaths: await getPackageDirs(),
      }) as ManifestOption,
      metadata: flags.metadata && {
        metadataEntries: flags.metadata,
        directoryPaths: await getPackageDirs(),
      },
    });

    const targetOrg = await resolveTargetOrg(flags['target-org']);

    this.log(`${EOL}${messages.getMessage('deploy.metadata.api', [targetOrg, resolveRestDeploy()])}${EOL}`);

    const deploy = await componentSet.deploy({
      usernameOrConnection: targetOrg,
      apiOptions: {
        testLevel: flags['test-level'] as TestLevel,
      },
    });

    if (!this.jsonEnabled()) {
      new DeployProgress(deploy).start();
    }

    const result = await deploy.pollStatus(500, Duration.minutes(flags.wait).seconds);
    this.setExitCode(result);

    // eslint-disable-next-line no-console
    // console.log(result);
    if (!this.jsonEnabled()) {
      displaySuccesses(result);
      displayFailures(result);
      displayTestResults(result);
    }
    return {
      files: asRelativePaths(result?.getFileResponses() || []),
      tests: this.getTestResults(result),
    };
  }

  private setExitCode(result: DeployResult): void {
    const status = getString(result, 'response.status');
    if (status !== RequestStatus.Succeeded) {
      process.exitCode = 1;
    }
  }

  private getTestResults(result: DeployResult): TestResults {
    const passing = getNumber(result, 'response.numberTestsCompleted');
    const failing = getNumber(result, 'response.numberTestErrors');
    const total = getNumber(result, 'response.numberTestsTotal');
    const time = getNumber(result, 'response.details.runTestResult.totalTime');
    return { passing, failing, total, time };
  }
}
