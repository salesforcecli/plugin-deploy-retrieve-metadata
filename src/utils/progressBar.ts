/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as util from 'util';
import cli from 'cli-ux';
import { env, once } from '@salesforce/kit';
import { MetadataApiDeploy } from '@sf/sdr';
import { Messages } from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
const mdTrasferMessages = Messages.loadMessages('@salesforce/plugin-deploy-retrieve-metadata', 'metadata.transfer');

const startProgressBar = once((bar: ProgressBar.Bar, total: number, payload = {}) => {
  bar.start(total);
  if (Object.keys(payload).length) {
    bar.update(0, payload);
  }
});

export class ProgressBar {
  private static DEFAULT_OPTIONS = {
    title: 'PROGRESS',
    format: '%s | {bar} | {value}/{total} Components',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    linewrap: true,
  };

  private bar: ProgressBar.Bar;
  private total!: number;

  public constructor(options: Partial<ProgressBar.Options> = ProgressBar.DEFAULT_OPTIONS) {
    const opts = Object.assign(ProgressBar.DEFAULT_OPTIONS, options);
    opts.format = util.format(opts.format, opts.title);
    this.bar = cli.progress({
      format: opts.format,
      barCompleteChar: opts.barCompleteChar,
      barIncompleteChar: opts.barIncompleteChar,
      linewrap: opts.linewrap,
    }) as ProgressBar.Bar;
  }

  public setTotal(total: number): void {
    this.total = total;
    this.bar.setTotal(total);
  }

  public start(total: number, payload = {}): void {
    this.total = total;
    startProgressBar(this.bar, total, payload);
  }

  public update(num: number, payload = {}): void {
    this.bar.update(num, payload);
  }

  public finish(payload = {}): void {
    this.bar.update(this.total, payload);
    this.bar.stop();
  }

  public stop(): void {
    this.bar.stop();
  }
}

export namespace ProgressBar {
  export type Bar = {
    start: (num: number, payload?: unknown) => void;
    update: (num: number, payload?: unknown) => void;
    updateTotal: (num: number) => void;
    setTotal: (num: number) => void;
    stop: () => void;
  };

  export type Options = {
    title: string;
    format: string;
    barCompleteChar: string;
    barIncompleteChar: string;
    linewrap: boolean;
  };
}

export class DeployProgress extends ProgressBar {
  public constructor(private deploy: MetadataApiDeploy) {
    super({
      title: 'Status',
      format: '%s: {status} | {bar} | {value}/{total} Components',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      linewrap: true,
    });
  }

  public start(): void {
    if (!env.getBoolean('SF_USE_PROGRESS_BAR', true)) return;

    this.deploy.onUpdate((data) => {
      // the numCompTot. isn't computed right away, wait to start until we know how many we have
      if (data.numberComponentsTotal) {
        super.setTotal(data.numberComponentsTotal + data.numberTestsTotal);
        this.update(data.numberComponentsDeployed + data.numberTestsCompleted, {
          status: mdTrasferMessages.getMessage(data.status),
        });
      } else {
        super.start(0, { status: mdTrasferMessages.getMessage(data.status) ?? 'Waiting' });
      }

      // the numTestsTot. isn't computed until validated as tests by the server, update the PB once we know
      if (data.numberTestsTotal && data.numberComponentsTotal) {
        this.setTotal(data.numberComponentsTotal + data.numberTestsTotal);
      }
    });

    // any thing else should stop the progress bar
    this.deploy.onFinish((data) => this.finish({ status: mdTrasferMessages.getMessage(data.response.status) }));

    this.deploy.onCancel(() => this.stop());

    this.deploy.onError((error: Error) => {
      this.stop();
      throw error;
    });
  }
}
