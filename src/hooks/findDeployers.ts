/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfdxProject } from '@salesforce/core';
import { OrgDeployer } from '../utils/orgDeployer';

const hook = async function (): Promise<OrgDeployer[]> {
  const project = await SfdxProject.resolve();
  const packageDirectories = project.getPackageDirectories();
  return [new OrgDeployer(packageDirectories)];
};

export default hook;
