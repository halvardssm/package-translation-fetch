declare module "index" {
    import commander from 'commander';
    export type SupportedGitHosts = 'github' | 'gitlab';
    export const GIT_HOST_GITHUB = "github";
    export const GIT_HOST_GITLAB = "gitlab";
    export const GIT_HOST_ALL: SupportedGitHosts[];
    export interface ProgramOptions {
        repo: string;
        path: string;
        host: SupportedGitHosts;
        folder: string;
        hooks?: string;
        token?: string;
    }
    export type ProgramCommander = ProgramOptions | commander.CommanderStatic;
    const main: (argv?: string[]) => Promise<void>;
    export default main;
}
declare module "fetcher" {
    import { ProgramOptions } from "index";
    export interface TranslationInformation {
        path: string;
        name: string;
    }
    export class Fetcher {
        private state;
        private apiUrl;
        constructor(options: ProgramOptions);
        run(): Promise<void>;
        private _fetch;
        private _parseApiUrl;
        private _urlSwitch;
        private _triggerHooks;
        private _timeout;
        private _getTranslationInfo;
        private _parseContent;
        private _fetchTranslations;
    }
}
