/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Aliases, Config, ConfigAggregator, SfdxError, SfdxProject } from '@salesforce/core';
import { Nullable } from '@salesforce/ts-types';

export const resolveTargetOrg = async (targetOrg: Nullable<string>): Promise<string> => {
  const aliasOrUsername = targetOrg || (ConfigAggregator.getValue(Config.DEFAULT_USERNAME)?.value as string);

  if (!aliasOrUsername) {
    throw new SfdxError('no target environment specified', 'NoTargetEnv', [
      'specify target environment with the --target-env flag',
      'set the default environment with "sf config set defaultusername"',
    ]);
  }

  return (await Aliases.fetch(aliasOrUsername)) || aliasOrUsername;
};

export const getPackageDirs = async (): Promise<string[]> => {
  const project = await SfdxProject.resolve();
  return project.getUniquePackageDirectories().map((pDir) => pDir.fullPath);
};
