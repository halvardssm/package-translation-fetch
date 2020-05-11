"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const commander_1 = __importDefault(require("commander"));
const fetcher_1 = require("./fetcher");
const path_1 = __importDefault(require("path"));
exports.GIT_HOST_GITHUB = 'github';
exports.GIT_HOST_GITLAB = 'gitlab';
exports.GIT_HOST_ALL = [exports.GIT_HOST_GITHUB, exports.GIT_HOST_GITLAB]; //|'bitbucket'|'azure'
const OPTION_REPO = 'repo';
const OPTION_PATH = 'path';
const OPTION_HOOKS = 'hooks';
const OPTION_HOST = 'host';
const OPTION_TOKEN = 'token';
const OPTION_FOLDER = 'folder';
const OPTION_CONFIG = 'config';
const main = (argv = process.argv) => __awaiter(void 0, void 0, void 0, function* () {
    const configIndex = argv.findIndex(el => el === '-c' || el === `--${OPTION_CONFIG}`);
    let configPath = `${process.cwd()}/.env`;
    if (configIndex >= 1 && configIndex < argv.length - 2 && !argv[configIndex].startsWith('-')) {
        const configPathRaw = argv[configIndex + 1];
        configPath = path_1.default.resolve(process.cwd(), configPathRaw);
    }
    dotenv.config({ path: configPath });
    commander_1.default
        .requiredOption(`-r, --${OPTION_REPO} <${OPTION_REPO}>`, 'the translation repo id, on gitlab this is the project id while on github this is the owner+repo name. E.g. 1234567, halvardssm/translations', process.env.TRANS_REPO)
        .option(`-p, --${OPTION_PATH} <${OPTION_PATH}>`, 'path to the folder containing the translations, if empty it will take the root', process.env.TRANS_PATH || '.')
        .option(`--${OPTION_HOST} <${OPTION_HOST}>`, 'the git host, can be one of: github, gitlab', process.env.TRANS_HOST || 'github')
        .option(`-f, --${OPTION_FOLDER} <${OPTION_FOLDER}>`, 'the download folder', process.env.TRANS_PATH || 'src/translations')
        .option(`-c, --${OPTION_CONFIG} <${OPTION_CONFIG}>`, 'path to the env file, defaults to ./.env', configPath)
        .option(`--${OPTION_HOOKS} <${OPTION_HOOKS}>`, 'string of webhook codes separated by space, ex: "123 123"', process.env.TRANS_HOOKS)
        .option(`-t, --${OPTION_TOKEN} <${OPTION_TOKEN}>`, 'the gitlab token', process.env.TRANS_TOKEN)
        .parse(argv);
    [OPTION_REPO].forEach(el => {
        if (commander_1.default[el] === undefined || commander_1.default[el] === '')
            throw new Error(`Flag ${el} not defined`);
    });
    let program = commander_1.default;
    const fetcher = new fetcher_1.Fetcher(program);
    yield fetcher.run();
});
exports.default = main;
module.exports = main;
//# sourceMappingURL=index.js.map