#!/usr/bin/env node

import * as fs from "fs";
import nodeFetch, {
  HeadersInit,
  RequestInfo,
  RequestInit,
  Response,
} from "node-fetch";
import {
  GIT_HOST_GITHUB,
  GIT_HOST_GITLAB,
  ProgramOptions,
  SupportedGitHosts,
} from "./bin";

export interface TranslationInformation {
  path: string;
  name: string;
}

export default class Fetcher {
  private state: ProgramOptions;
  private apiUrl: string;

  constructor(options: ProgramOptions) {
    this.state = { ...options };
    this.apiUrl = this._parseApiUrl();
  }

  async run(): Promise<void> {
    try {
      const fileRegExp = RegExp("[a-z_-]+.json");
      console.info("Starting translation fetch");

      const translationInfoRaw = await this._getTranslationInfo();

      if (this.state.hooks) {
        await this._triggerHooks();
        await this._timeout(10000);
      }

      const translationInfo =
        (await translationInfoRaw.json() as Array<TranslationInformation>)
          .filter((el) => fileRegExp.test(el.path));

      await this._fetchTranslations(translationInfo);

      console.log("Translations downloaded");
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }

  private async _fetch(
    url: RequestInfo,
    appendHeader = false,
  ): Promise<Response> {
    let headers: RequestInit;

    if (this.state.token && appendHeader) {
      let headerToken: HeadersInit;

      switch (this.state.host) {
        case GIT_HOST_GITHUB:
          headerToken = { "Authorization": `token ${this.state.token}` };
          break;
        case GIT_HOST_GITLAB:
          headerToken = { "Private-Token": this.state.token };
          break;
      }

      headers = { headers: headerToken };
    }

    const result = await nodeFetch(url, headers);

    if (result.status !== 200) {
      throw new Error(`Fetch failed:\n${url}\n${await result.text()}`);
    }

    return result;
  }

  private _parseApiUrl(): string {
    switch (this.state.host) {
      case GIT_HOST_GITHUB:
        return "https://api.github.com/repos";
      case GIT_HOST_GITLAB:
        return "https://gitlab.com/api/v4/projects";
      default:
        throw new Error("Git host not supported");
    }
  }

  private _urlSwitch(options: { [name in SupportedGitHosts]: string }): string {
    return options[this.state.host];
  }

  private async _triggerHooks(): Promise<void> {
    console.info("Triggering Hooks");

    await Promise.all(
      this.state.hooks.split(" ").map((el) => {
        const url = `https://api.poeditor.com/webhooks/${el}`;

        return this._fetch(url);
      }),
    );
  }

  private async _timeout(duration: number): Promise<void> {
    console.info(
      `Waiting ${duration / 1000} seconds for POEditor to commit changes`,
    );

    return await new Promise((resolve) => setTimeout(resolve, duration));
  }

  private async _getTranslationInfo(): Promise<Response> {
    console.info("Fetching translation info");

    const append = this._urlSwitch(
      {
        gitlab: `${this.state.repo}/repository/tree?path=${this.state.path}`,
        github: `${this.state.repo}/contents/${this.state.path}`,
      },
    );

    const url = `${this.apiUrl}/${append}`;

    return await this._fetch(url, true);
  }

  private async _parseContent(file: Response): Promise<Buffer> {
    switch (this.state.host) {
      case GIT_HOST_GITLAB:
        return await file.buffer();
      case GIT_HOST_GITHUB:
        const content = await file.json();
        return Buffer.from(content.content, content.encoding);
      default:
        return await file.json();
    }
  }

  private async _fetchTranslations(
    data: Array<TranslationInformation>,
  ): Promise<void> {
    console.info("Downloading translations");

    for await (const el of data) {
      const fileUrl = el.path.replace("/", "%2F");

      const append = this._urlSwitch(
        {
          gitlab: `/repository/files/${fileUrl}/raw?ref=master`,
          github: `/contents/${fileUrl}`,
        },
      );

      const file = await this._fetch(
        `${this.apiUrl}/${this.state.repo}${append}`,
        true,
      );

      const content = await this._parseContent(file);

      const fileDownloadPath = `${process.cwd()}/${this.state.folder}`;

      fs.mkdirSync(fileDownloadPath, { recursive: true });
      fs.writeFileSync(
        `${fileDownloadPath}/${el.name}`,
        content,
      );

      console.info(`${el.name} saved`);
    }
  }
}
