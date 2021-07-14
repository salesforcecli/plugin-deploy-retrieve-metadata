/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Command, Flags } from '@oclif/core';
import { Messages } from '@salesforce/core';
import { Duration } from '@salesforce/kit';
import { FileResponse } from '@salesforce/source-deploy-retrieve';

import { getPackageDirs, resolveTargetOrg } from '../../utils/orgs';
import { ComponentSetBuilder, ManifestOption } from '../../utils/componentSetBuilder';
import { displayHumanReadableResults } from '../../utils/tableBuilder';
import { TestLevel } from '../../utils/testLevel';
import { DeployProgress } from '../../utils/progressBar';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-deploy-retrieve-metadata', 'deploy.metadata');

export type DeployMetadataResult = FileResponse[];

export default class DeployMetadata extends Command {
  public static readonly description = messages.getMessage('description');
  public static readonly summary = messages.getMessage('summary');
  public static readonly examples = messages.getMessages('examples');
  public static flags = {
    metadata: Flags.string({
      char: 'm',
      description: messages.getMessage('flags.metadata'),
      summary: messages.getMessage('flags.metadata.summary'),
      multiple: true,
    }),
    manifest: Flags.string({
      char: 'x',
      description: messages.getMessage('flags.manifest'),
      summary: messages.getMessage('flags.manifest.summary'),
    }),
    'deploy-dir': Flags.string({
      char: 'd',
      description: messages.getMessage('flags.deploy-dir'),
      summary: messages.getMessage('flags.deploy-dir.summary'),
      multiple: true,
    }),
    'target-org': Flags.string({
      description: messages.getMessage('flags.target-org'),
    }),
    'test-level': Flags.string({
      char: 'l',
      description: messages.getMessage('flags.test-level'),
      summary: messages.getMessage('flags.test-level.summary'),
      options: Object.values(TestLevel),
      default: TestLevel.NoTestRun,
    }),
    wait: Flags.integer({
      summary: messages.getMessage('flags.wait.summary'),
      description: messages.getMessage('flags.wait.description'),
      default: 33,
    }),
  };

  public async run(): Promise<DeployMetadataResult> {
    const flags = (await this.parse(DeployMetadata)).flags;
    const componentSet = await ComponentSetBuilder.build({
      directory: flags['deploy-dir'],
      manifest: (flags.manifest && {
        manifestPath: flags.manifest,
        directoryPaths: await getPackageDirs(),
      }) as ManifestOption,
      metadata: flags.metadata && {
        metadataEntries: flags.metadata,
        directoryPaths: await getPackageDirs(),
      },
    });

    const deploy = await componentSet.deploy({
      usernameOrConnection: await resolveTargetOrg(flags['target-org']),
      apiOptions: {
        testLevel: flags['test-level'] as TestLevel,
      },
    });

    if (!this.jsonEnabled()) {
      new DeployProgress(deploy).start();
    }

    const result = await deploy.pollStatus(500, Duration.minutes(flags.wait).seconds);

    const fileResponses = result?.getFileResponses() || [];
    if (!flags.json) {
      displayHumanReadableResults(fileResponses);
    }
    return fileResponses;
  }

  protected toSuccessJson(result: FileResponse[]): { status: number; result: FileResponse[] } {
    return { status: 0, result };
  }

  protected toErrorJson(err: unknown): { status: number; err: unknown } {
    return { status: process.exitCode || 1, err };
  }
}