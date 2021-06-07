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
import cli from 'cli-ux';
import { ComponentSetBuilder } from '../../../componentSetBuilder';

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
    json: Flags.boolean({
      description: 'json output',
    }),
  };

  public async run(): Promise<DeployOrgResult> {
    const flags = (await this.parse(DeployOrg)).flags;
    const componentSet = await ComponentSetBuilder.build({
      directory: flags.directory,
      manifest: flags.manifest && {
        manifestPath: flags.manifest,
        directoryPaths: await this.getPackageDirs(),
      },
      metadata: flags.metadata && {
        metadataEntries: flags.metadata,
        directoryPaths: await this.getPackageDirs(),
      },
    });

    const deploy = componentSet.deploy({
      usernameOrConnection: await this.resolveTargetEnv(flags['target-org']),
    });

    const deployResult = await deploy.start();
    const fileResponses = deployResult.getFileResponses();
    if (!flags.json) {
      this.displayHumanReadableResults(fileResponses);
    } else {
      this.log(JSON.stringify({ status: 0, result: [] }).trim());
    }
    return fileResponses;
  }

  private displayHumanReadableResults(fileResponses: FileResponse[]): void {
    const columns = {
      fullName: { header: 'Name' },
      type: { header: 'Type' },
      filePath: { header: 'Path' },
    };
    const options = { sort: 'type' };
    cli.table(fileResponses, columns, options);
  }

  private async getPackageDirs(): Promise<string[]> {
    const project = await SfdxProject.resolve();
    return project.getUniquePackageDirectories().map((pDir) => pDir.fullPath);
  }

  private async resolveTargetEnv(targetEnv: Nullable<string>): Promise<string> {
    const aliasOrEnv = targetEnv || (ConfigAggregator.getValue(Config.DEFAULT_USERNAME)?.value as string);

    if (!aliasOrEnv) {
      throw new SfdxError(
        messages.getMessage('NoTargetEnv'),
        'NoTargetEnv',
        messages.getMessages('NoTargetEnvActions')
      );
    }

    const env = (await Aliases.fetch(aliasOrEnv)) || aliasOrEnv;

    return env;
  }
}
