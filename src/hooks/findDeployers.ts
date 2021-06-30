/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfdxProject } from '@salesforce/core';
import { Options } from '@salesforce/plugin-project-utils';
import { OrgDeployer } from '../utils/orgDeployer';

const hook = async function (options: Options): Promise<OrgDeployer[]> {
  const project = await SfdxProject.resolve();
  const packageDirectories = project.getPackageDirectories();
  return [new OrgDeployer(packageDirectories, options)];
};

export default hook;
