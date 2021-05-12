/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { EOL } from 'os';

import { Command } from '@oclif/core';

// TODO: add back once md messages are supported
// Messages.importMessagesDirectory(__dirname);
// const messages = Messages.loadMessages('@salesforce/plugin-project-org', 'deploy');

export default class DeployOrg extends Command {
  // public static readonly description = messages.getMessage('description');
  // public static readonly examples = messages.getMessage('examples').split(EOL);
  public static readonly description = 'connect to a Salesforce account or environment';
  public static readonly examples = ''.split(EOL);
  public static flags = {};

  public async run(): Promise<unknown> {
    const flags = (await this.parse(DeployOrg)).flags;
    return flags;
  }
}
