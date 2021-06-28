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
import { ComponentSetBuilder, ManifestOption } from '../../../utils/componentSetBuilder';
import { displayHumanReadableResults } from '../../../utils/tableBuilder';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/plugin-project-org', 'deploy', [
  'description',
  'examples',
  'metadata',
  'manifest',
  'directory',
  'target-org',
  'NoTargetEnv',
  'NoTargetEnvActions',
]);

export type DeployOrgResult = FileResponse[];

export default class DeployOrg extends Command {
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static flags = {
    metadata: Flags.string({
      char: 'm',
      description: messages.getMessage('metadata'),
      multiple: true,
    }),
    manifest: Flags.string({
      char: 'x',
      description: messages.getMessage('manifest'),
    }),
    directory: Flags.string({
      char: 'd',
      description: messages.getMessage('directory'),
      multiple: true,
    }),
    'target-org': Flags.string({
      char: 'e',
      description: messages.getMessage('target-org'),
    }),
  };

  public async run(): Promise<DeployOrgResult> {
    const flags = (await this.parse(DeployOrg)).flags;
    const componentSet = await ComponentSetBuilder.build({
      directory: flags.directory,
      manifest: (flags.manifest && {
        manifestPath: flags.manifest,
        directoryPaths: await this.getPackageDirs(),
      }) as ManifestOption,
      metadata: flags.metadata && {
        metadataEntries: flags.metadata,
        directoryPaths: await this.getPackageDirs(),
      },
    });

    const deploy = componentSet.deploy({
      usernameOrConnection: await this.resolveTargetOrg(flags['target-org']),
    });

    const deployResult = await deploy.start();
    const fileResponses = deployResult?.getFileResponses() || [];
    if (!flags.json) {
      displayHumanReadableResults(fileResponses);
    }
    return fileResponses;
  }

  protected toSuccessJson(result: FileResponse[]): { status: number; result: FileResponse[] } {
    return { status: 0, result };
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
