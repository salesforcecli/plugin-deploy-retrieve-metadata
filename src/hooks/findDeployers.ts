/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfdxProject } from '@salesforce/core';
import { MetadataDeployer } from '../utils/metadataDeployer';

const hook = async function (): Promise<MetadataDeployer[]> {
  const project = await SfdxProject.resolve();
  const packageDirectories = project.getPackageDirectories();
  return [new MetadataDeployer(packageDirectories)];
};

export default hook;
