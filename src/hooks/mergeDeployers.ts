/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Options } from '@salesforce/plugin-project-utils';
import { MergedOrgDeployer, OrgDeployer } from '../utils/orgDeployer';

// eslint-disable-next-line @typescript-eslint/require-await
const hook = async function (options: Options): Promise<void> {
  const orgDeployers = Array.from(options.deployers).filter((d) => d.getAppType() === 'org') as OrgDeployer[];
  orgDeployers.forEach((deployer) => options.deployers.delete(deployer));
  options.deployers.add(new MergedOrgDeployer(orgDeployers, options));
};

export default hook;
