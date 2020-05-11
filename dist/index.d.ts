declare module "fetcher" {
    export interface FetcherOptions {
        token: string;
        folder: string;
        downloadPath: string;
        repo: string;
        hooks: string[];
        apiUrl?: string;
    }
    export interface TranslationInformation {
        path: string;
        name: string;
    }
    export class Fetcher {
        private token;
        private folder;
        private downloadPath;
        private repo;
        private hooks;
        private repoUrl;
        constructor({ token, hooks, folder, downloadPath, apiUrl, repo }: FetcherOptions);
        run(): Promise<void>;
        private _generateUrl;
        private _repoExistsFn;
        private _triggerHooks;
        private _getTranslationInfo;
        private _timeout;
        private _fetchTranslations;
    }
}
declare module "index" {
    import commander from 'commander';
    export interface ProgramOptions extends commander.CommanderStatic {
        hooks: string;
        repo: string;
        folder: string;
        token: string;
        path: string;
    }
    const main: (argv?: string[]) => Promise<void>;
    export default main;
}
