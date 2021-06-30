/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { FileResponse } from '@salesforce/source-deploy-retrieve';
import cli from 'cli-ux';

export function displayHumanReadableResults(fileResponses: FileResponse[]): void {
  const columns = {
    fullName: { header: 'Name' },
    type: { header: 'Type' },
    filePath: { header: 'Path' },
  };
  const options = { sort: 'type' };
  cli.table(fileResponses, columns, options);
}
