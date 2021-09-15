/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags } from '@oclif/core';
import { EnvironmentVariable, Messages, OrgConfigProperties, SfdxPropertyKeys, SfdxProject } from '@salesforce/core';
import { Duration } from '@salesforce/kit';
import { FileResponse, RetrieveResult } from '@sf/sdr';

import { SfCommand, toHelpSection } from '@salesforce/sf-plugins-core';
import { getPackageDirs, resolveTargetOrg } from '../../utils/orgs';
import { ComponentSetBuilder, ManifestOption } from '../../utils/componentSetBuilder';
import { displaySuccesses } from '../../utils/output';
import { validateOneOfCommandFlags } from '../../utils/requiredFlagValidator';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-deploy-retrieve-metadata', 'retrieve.metadata');

// One of these flags must be specified for a valid deploy.
const requiredFlags = ['manifest', 'metadata', 'source-dir'];

export type RetrieveMetadataResult = FileResponse[];

export default class RetrieveMetadata extends SfCommand<RetrieveMetadataResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');
  public static flags = {
    'api-version': Flags.string({
      char: 'a',
      summary: messages.getMessage('flags.api-version.summary'),
      description: messages.getMessage('flags.api-version.description'),
    }),
    manifest: Flags.string({
      char: 'x',
      summary: messages.getMessage('flags.manifest.summary'),
      description: messages.getMessage('flags.manifest.description'),
      exclusive: ['metadata', 'source-dir'],
    }),
    metadata: Flags.string({
      char: 'm',
      summary: messages.getMessage('flags.metadata.summary'),
      multiple: true,
      exclusive: ['manifest', 'source-dir'],
    }),
    'package-name': Flags.string({
      char: 'n',
      summary: messages.getMessage('flags.package-name.summary'),
      multiple: true,
    }),
    'source-dir': Flags.string({
      char: 'd',
      summary: messages.getMessage('flags.source-dir.summary'),
      description: messages.getMessage('flags.source-dir.description'),
      multiple: true,
      exclusive: ['manifest', 'metadata'],
    }),
    'target-org': Flags.string({
      char: 'o',
      summary: messages.getMessage('flags.target-org.summary'),
      description: messages.getMessage('flags.target-org.description'),
    }),
    wait: Flags.integer({
      char: 'w',
      default: 33,
      summary: messages.getMessage('flags.wait.summary'),
      description: messages.getMessage('flags.wait.description'),
    }),
  };

  public static configurationVariablesSection = toHelpSection(
    'CONFIGURATION VARIABLES',
    OrgConfigProperties.TARGET_ORG,
    SfdxPropertyKeys.API_VERSION
  );
  public static envVariablesSection = toHelpSection(
    'ENVIRONMENT VARIABLES',
    EnvironmentVariable.SF_TARGET_ORG,
    EnvironmentVariable.SFDX_DEFAULTUSERNAME
  );

  protected retrieveResult!: RetrieveResult;

  public async run(): Promise<RetrieveMetadataResult> {
    const flags = (await this.parse(RetrieveMetadata)).flags;

    validateOneOfCommandFlags(requiredFlags, flags);

    const componentSet = await ComponentSetBuilder.build({
      apiversion: flags['api-version'],
      sourcepath: flags['source-dir'],
      packagenames: flags['package-name'],
      manifest: (flags.manifest && {
        manifestPath: flags.manifest,
        directoryPaths: await getPackageDirs(),
      }) as ManifestOption,
      metadata: flags.metadata && {
        metadataEntries: flags.metadata,
        directoryPaths: await getPackageDirs(),
      },
    });

    const project = await SfdxProject.resolve();

    const retrieve = await componentSet.retrieve({
      usernameOrConnection: await resolveTargetOrg(flags['target-org']),
      merge: true,
      output: project.getDefaultPackage().fullPath,
      packageOptions: flags['package-name'],
    });

    await retrieve.start();
    const result = await retrieve.pollStatus(500, Duration.minutes(flags.wait).seconds);

    const fileResponses = result?.getFileResponses() || [];

    if (!flags.json) {
      displaySuccesses(result);
    }
    return fileResponses;
  }
}
