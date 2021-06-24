/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfdxProject } from '@salesforce/core';
import { Options } from '@salesforce/plugin-project-utils';
import { OrgDeployer } from '../utils/orgDeployer';

const hook = async function (options: Options): Promise<void> {
  const project = await SfdxProject.resolve();
  const packageDirectories = project.getPackageDirectories();
  for (const pkg of packageDirectories) {
    const deployer = new OrgDeployer(pkg, options);
    options.deployers.add(deployer);
  }
};

export default hook;
