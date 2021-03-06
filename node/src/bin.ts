#!/usr/bin/env node

import commander from "commander";
import * as dotenv from "dotenv";
import path from "path";
import Fetcher from "./bin-fetcher";

export type SupportedGitHosts = "github" | "gitlab"; //|'bitbucket'|'azure'

export const GIT_HOST_GITHUB = "github";
export const GIT_HOST_GITLAB = "gitlab";
export const GIT_HOST_ALL: SupportedGitHosts[] = [
  GIT_HOST_GITHUB,
  GIT_HOST_GITLAB,
]; //, 'bitbucket', 'azure']

export interface ProgramOptions {
  repo: string;
  path: string;
  host: SupportedGitHosts;
  folder: string;
  hooks?: string;
  token?: string;
  branch: string;
}

export interface EnvironmentOptions {
  LOCALES_REPO?: string;
  LOCALES_PATH?: string;
  LOCALES_HOOKS?: string;
  LOCALES_HOST?: string;
  LOCALES_TOKEN?: string;
  LOCALES_FOLDER?: string;
  LOCALES_ENV?: string;
  LOCALES_BRANCH?: string;
}

export type ProgramCommander = ProgramOptions | commander.CommanderStatic;

const OPTION_REPO = "repo";
const OPTION_PATH = "path";
const OPTION_HOOKS = "hooks";
const OPTION_HOST = "host";
const OPTION_TOKEN = "token";
const OPTION_FOLDER = "folder";
const OPTION_ENV = "env";
const OPTION_BRANCH = "branch";

export async function main(argv = process.argv): Promise<void> {
  const configIndex = argv.findIndex((el) =>
    el === "-e" || el === `--${OPTION_ENV}`
  );
  let configPath = `${process.cwd()}/.env`;

  if (
    configIndex >= 1 && configIndex < argv.length - 2 &&
    !argv[configIndex].startsWith("-")
  ) {
    const configPathRaw = argv[configIndex + 1];
    configPath = path.resolve(process.cwd(), configPathRaw);
  }

  dotenv.config({ path: configPath });

  commander
    .requiredOption(
      `-r, --${OPTION_REPO} <${OPTION_REPO}>`,
      "the translation repo id, on gitlab this is the project id while on github this is the owner+repo name. E.g. 1234567, package/translations",
      process.env.LOCALES_REPO,
    )
    .option(
      `-p, --${OPTION_PATH} <${OPTION_PATH}>`,
      "path to the folder containing the translations, if empty it will take the root",
      process.env.LOCALES_PATH || ".",
    )
    .option(
      `--${OPTION_HOST} <${OPTION_HOST}>`,
      "the git host, can be one of: github, gitlab",
      process.env.LOCALES_HOST || GIT_HOST_GITHUB,
    )
    .option(
      `-f, --${OPTION_FOLDER} <${OPTION_FOLDER}>`,
      "the download folder",
      process.env.LOCALES_FOLDER || "src/translations",
    )
    .option(
      `-b, --${OPTION_BRANCH} <${OPTION_BRANCH}>`,
      "the download folder",
      process.env.LOCALES_BRANCH || "main",
    )
    .option(
      `--${OPTION_HOOKS} <${OPTION_HOOKS}>`,
      'string of webhook codes separated by space, ex: "123 123"',
      process.env.LOCALES_HOOKS,
    )
    .option(
      `-t, --${OPTION_TOKEN} <${OPTION_TOKEN}>`,
      "the authentication token",
      process.env.LOCALES_TOKEN,
    )
    .option(
      `-e, --${OPTION_ENV} <${OPTION_ENV}>`,
      "path to the env file, defaults to ./.env",
      configPath,
    )
    .parse(argv);

  [OPTION_REPO].forEach((el) => {
    if (commander[el] === undefined || commander[el] === "") {
      throw new Error(`Flag ${el} not defined`);
    }
  });

  const program: ProgramOptions =
    commander as ProgramCommander as ProgramOptions;

  const fetcher = new Fetcher(program);

  await fetcher.run();
}

if (require.main === module) {
  main(process.argv);
}
