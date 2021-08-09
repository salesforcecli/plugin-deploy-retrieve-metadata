/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as util from 'util';
import cli from 'cli-ux';
import { env, once } from '@salesforce/kit';
import { MetadataApiDeploy } from '@salesforce/source-deploy-retrieve';

const startProgressBar = once((bar: ProgressBar.Bar, total: number) => {
  bar.start(total);
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

  public start(total: number): void {
    this.total = total;
    startProgressBar(this.bar, total);
  }

  public update(num: number): void {
    this.bar.update(num);
  }

  public finish(): void {
    this.bar.update(this.total);
    this.bar.stop();
  }

  public stop(): void {
    this.bar.stop();
  }
}

export namespace ProgressBar {
  export type Bar = {
    start: (num: number) => void;
    update: (num: number) => void;
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
    super();
  }

  public start(): void {
    if (!env.getBoolean('SF_USE_PROGRESS_BAR', true)) return;

    this.deploy.onUpdate((data) => {
      // the numCompTot. isn't computed right away, wait to start until we know how many we have
      if (data.numberComponentsTotal) {
        super.start(data.numberComponentsTotal + data.numberTestsTotal);
        this.update(data.numberComponentsDeployed + data.numberTestsCompleted);
      }

      // the numTestsTot. isn't computed until validated as tests by the server, update the PB once we know
      if (data.numberTestsTotal && data.numberComponentsTotal) {
        this.setTotal(data.numberComponentsTotal + data.numberTestsTotal);
      }
    });

    // any thing else should stop the progress bar
    this.deploy.onFinish(() => this.finish());

    this.deploy.onCancel(() => this.stop());

    this.deploy.onError((error: Error) => {
      this.stop();
      throw error;
    });
  }
}
