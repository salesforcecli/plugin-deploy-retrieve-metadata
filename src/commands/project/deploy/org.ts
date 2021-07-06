/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Command, Flags } from '@oclif/core';
import { Aliases, Config, ConfigAggregator, Messages, SfdxError, SfdxProject } from '@salesforce/core';
import { FileResponse } from '@salesforce/source-deploy-retrieve';
import { Nullable } from '@salesforce/ts-types';
import { Duration } from '@salesforce/kit';
import { ComponentSetBuilder, ManifestOption } from '../../../utils/componentSetBuilder';
import { displayHumanReadableResults } from '../../../utils/tableBuilder';
import { TestLevel } from '../../../utils/testLevel';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/plugin-project-org', 'project.deploy.org', [
  'summary',
  'description',
  'examples',
  'flags.metadata',
  'flags.manifest',
  'flags.deploy-dir',
  'flags.target-org',
  'flags.test-level',
  'flags.deploy-dir.summary',
  'flags.metadata.summary',
  'flags.manifest.summary',
  'flags.test-level.summary',
  'flags.wait.summary',
  'flags.wait.description',
  'NoTargetEnv',
  'NoTargetEnvActions',
]);

export type DeployOrgResult = FileResponse[];

export default class DeployOrg extends Command {
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

  public async run(): Promise<DeployOrgResult> {
    const flags = (await this.parse(DeployOrg)).flags;
    const componentSet = await ComponentSetBuilder.build({
      directory: flags['deploy-dir'],
      manifest: (flags.manifest && {
        manifestPath: flags.manifest,
        directoryPaths: await this.getPackageDirs(),
      }) as ManifestOption,
      metadata: flags.metadata && {
        metadataEntries: flags.metadata,
        directoryPaths: await this.getPackageDirs(),
      },
    });

    const deploy = await componentSet.deploy({
      usernameOrConnection: await this.resolveTargetOrg(flags['target-org']),
      apiOptions: {
        testLevel: flags['test-level'] as TestLevel,
      },
    });

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

  private async getPackageDirs(): Promise<string[]> {
    const project = await SfdxProject.resolve();
    return project.getUniquePackageDirectories().map((pDir) => pDir.fullPath);
  }

  private async resolveTargetOrg(targetOrg: Nullable<string>): Promise<string> {
    const aliasOrUsername = targetOrg || (ConfigAggregator.getValue(Config.DEFAULT_USERNAME)?.value as string);

    if (!aliasOrUsername) {
      throw new SfdxError(
        messages.getMessage('NoTargetEnv'),
        'NoTargetEnv',
        messages.getMessages('NoTargetEnvActions')
      );
    }

    return (await Aliases.fetch(aliasOrUsername)) || aliasOrUsername;
  }
}
