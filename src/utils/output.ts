/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as path from 'path';
import { DeployResult, FileResponse, RetrieveResult } from '@salesforce/source-deploy-retrieve';
import { RequestStatus, Failures, Successes } from '@salesforce/source-deploy-retrieve/lib/src/client/types';
import cli from 'cli-ux';
import * as chalk from 'chalk';
import { getNumber } from '@salesforce/ts-types';

export function asRelativePaths(fileResponses: FileResponse[]): FileResponse[] {
  fileResponses.forEach((file) => {
    if (file.filePath) {
      file.filePath = path.relative(process.cwd(), file.filePath);
    }
  });
  return fileResponses;
}

// Sort by type > filePath > fullName
export function sortFileResponses(fileResponses: FileResponse[]): FileResponse[] {
  return fileResponses.sort((i, j) => {
    if (i.type === j.type) {
      if (i.filePath === j.filePath) {
        return i.fullName > j.fullName ? 1 : -1;
      }
      return i.filePath > j.filePath ? 1 : -1;
    }
    return i.type > j.type ? 1 : -1;
  });
}

export function sortTestResults(results: Failures[] | Successes[] = []): Failures[] | Successes[] {
  return results.sort((a: Successes, b: Successes) => {
    if (a.methodName === b.methodName) {
      return a.name > b.name ? 1 : -1;
    }
    return a.methodName > b.methodName ? 1 : -1;
  });
}

export function toArray<T>(entryOrArray: T | T[] | undefined): T[] {
  if (entryOrArray) {
    return Array.isArray(entryOrArray) ? entryOrArray : [entryOrArray];
  }
  return [];
}

export function displaySuccesses(result: DeployResult | RetrieveResult): void {
  const fileResponses = asRelativePaths(result.getFileResponses() ?? []);
  const successes = sortFileResponses(fileResponses.filter((f) => f.state !== 'Failed'));

  if (!successes.length) return;

  const columns = {
    state: { header: 'State' },
    fullName: { header: 'Name' },
    type: { header: 'Type' },
    filePath: { header: 'Path' },
  };
  const options = { title: chalk.blue.bold('Deployed Source') };
  cli.log();
  cli.table(successes, columns, options);
}

export function displayTestResults(result: DeployResult): void {
  cli.log();
  cli.log(chalk.blue.bold('Test Results Summary'));
  const passing = getNumber(result, 'response.numberTestsCompleted');
  const failing = getNumber(result, 'response.numberTestErrors');
  const total = getNumber(result, 'response.numberTestsTotal');
  const time = getNumber(result, 'response.details.runTestResult.totalTime');
  cli.log(`Passing: ${passing}`);
  cli.log(`Failing: ${failing}`);
  cli.log(`Total: ${total}`);
  if (time) cli.log(`Time: ${time}`);

  if (result?.response?.numberTestErrors) {
    const failures = toArray(result.response.details?.runTestResult?.failures);
    const failureCount = result.response.details.runTestResult?.numFailures;
    const tests = sortTestResults(failures);
    const columns = {
      name: { header: 'Name' },
      methodName: { header: 'Method' },
      message: { header: 'Message' },
      stackTrace: { header: 'Stacktrace' },
    };
    const options = {
      title: chalk.red.bold(`Test Failures [${failureCount}]`),
    };
    cli.log();
    cli.table(tests, columns, options);
  }
}

export function displayFailures(result: DeployResult | RetrieveResult): void {
  if (result.response.status === RequestStatus.Succeeded) return;

  const fileResponses = asRelativePaths(result.getFileResponses() ?? []);
  const failures = sortFileResponses(fileResponses.filter((f) => f.state === 'Failed'));
  if (!failures.length) return;

  const columns = {
    problemType: { header: 'Type' },
    fullName: { header: 'Name' },
    error: { header: 'Problem' },
  };
  const options = { title: chalk.red.bold(`Component Failures [${failures.length}]`) };
  cli.log();
  cli.table(failures, columns, options);
}
