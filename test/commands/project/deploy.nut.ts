/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as path from 'path';
import { SourceTestkit } from '@salesforce/source-testkit';
import { fs } from '@salesforce/core';
import { TestLevel } from '../../../src/utils/testLevel';
import { OrgDeployer } from '../../../src/utils/orgDeployer';

// Skip until this is merged https://github.com/forcedotcom/source-deploy-retrieve/pull/369
describe.skip('project deploy NUTs', () => {
  let sourceTestkit: SourceTestkit;

  before(async () => {
    sourceTestkit = await SourceTestkit.create({
      repository: 'https://github.com/trailheadapps/dreamhouse-lwc.git',
      executable: path.join(process.cwd(), 'bin', 'dev'),
      nut: __filename,
    });
  });

  after(async () => {
    await sourceTestkit?.clean();
  });

  describe('project-deploy-options.json', () => {
    it('should deploy force-app', async () => {
      const deployOptions = {
        [OrgDeployer.NAME]: {
          testLevel: TestLevel.NoTestRun,
          username: sourceTestkit.username,
          apps: ['force-app'],
        },
      };
      await fs.writeJson(path.join(sourceTestkit.projectDir, 'project-deploy-options.json'), deployOptions);
      await sourceTestkit.execute('project deploy', { json: false });
      await sourceTestkit.expect.filesToBeDeployed(['force-app/**/*'], ['force-app/test/**/*']);
    });
  });
});
