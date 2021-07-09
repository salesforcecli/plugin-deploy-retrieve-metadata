/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Command, Flags } from '@oclif/core';
import { Aliases, Config, ConfigAggregator, Messages, SfdxError, SfdxProject } from '@salesforce/core';
import { Duration } from '@salesforce/kit';
import { FileResponse, RetrieveResult } from '@salesforce/source-deploy-retrieve';
import { Nullable } from '@salesforce/ts-types';

import { ComponentSetBuilder } from '../../../utils/componentSetBuilder';
import { displayHumanReadableResults } from '../../../utils/tableBuilder';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-project-org', 'retrieve.org');

export type RetrieveOrgResult = FileResponse[];

export default class ProjectRetrieveOrg extends Command {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static flags = {
    'api-version': Flags.string({
      char: 'a',
      summary: messages.getMessage('flags.api-version.summary'),
    }),
    manifest: Flags.string({
      char: 'x',
      summary: messages.getMessage('flags.manifest.summary'),
      exclusive: ['metadata', 'sourcepath'],
    }),
    metadata: Flags.string({
      char: 'm',
      summary: messages.getMessage('flags.metadata.summary'),
      multiple: true,
      exclusive: ['manifest', 'sourcepath'],
    }),
    'package-name': Flags.string({
      char: 'n',
      summary: messages.getMessage('flags.package-name.summary'),
      multiple: true,
    }),
    'source-dir': Flags.string({
      char: 'd',
      summary: messages.getMessage('flags.source-dir.summary'),
      multiple: true,
      exclusive: ['manifest', 'metadata'],
    }),
    'target-org': Flags.string({
      char: 't',
      summary: messages.getMessage('flags.target-org.summary'),
    }),
    wait: Flags.integer({
      char: 'w',
      default: 33,
      summary: messages.getMessage('flags.wait.summary'),
    }),
  };

  protected retrieveResult: RetrieveResult;

  public async run(): Promise<RetrieveOrgResult> {
    const flags = (await this.parse(ProjectRetrieveOrg)).flags;

    const componentSet = await ComponentSetBuilder.build({
      apiversion: flags['api-version'],
      directory: flags['source-dir'],
      packagenames: flags['package-name'],
      manifest: flags.manifest && {
        manifestPath: flags.manifest,
        directoryPaths: await this.getPackageDirs(),
      },
      metadata: flags.metadata && {
        metadataEntries: flags.metadata,
        directoryPaths: await this.getPackageDirs(),
      },
    });

    const project = await SfdxProject.resolve();

    const retrieve = await componentSet.retrieve({
      usernameOrConnection: await this.resolveTargetOrg(flags['target-org']),
      merge: true,
      output: project.getDefaultPackage().fullPath,
      packageNames: flags['package-name'],
    });

    await retrieve.start();
    const result = await retrieve.pollStatus(500, Duration.minutes(flags.wait).seconds);

    const fileResponses = result?.getFileResponses() || [];

    if (!flags.json) {
      displayHumanReadableResults(fileResponses);
    }
    return fileResponses;
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
