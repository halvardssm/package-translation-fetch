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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
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
const fs = __importStar(require("fs"));
const node_fetch_1 = __importDefault(require("node-fetch"));
class Fetcher {
    constructor({ token, hooks, folder, downloadPath, apiUrl, repo }) {
        this.token = token;
        this.hooks = hooks;
        this.folder = folder;
        this.downloadPath = downloadPath;
        this.repo = repo;
        this.repoUrl = this._generateUrl(apiUrl);
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fileRegExp = RegExp('[a-z_-]+.json');
                console.log("Starting translation fetch");
                yield this._repoExistsFn();
                yield this._triggerHooks();
                yield this._timeout(10000);
                const translationInfoRaw = yield this._getTranslationInfo();
                const translationInfo = (yield translationInfoRaw.json())
                    .filter((el) => fileRegExp.test(el.path));
                yield this._fetchTranslations(translationInfo);
                console.log("Translations downloaded");
            }
            catch (error) {
                console.error(error);
                process.exit(1);
            }
        });
    }
    _generateUrl(apiUrl = 'https://gitlab.com/api/v4') {
        const url = `${apiUrl}/projects/${this.repo}/repository`;
        return url;
    }
    _repoExistsFn() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Checking if repo exists');
            return yield node_fetch_1.default(`${this.repoUrl}/tree`, { headers: { 'Private-Token': this.token } });
        });
    }
    _triggerHooks() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Triggering Hooks');
            yield Promise.all(this.hooks.map((el) => {
                const url = `https://api.poeditor.com/webhooks/${el}`;
                console.log(`Triggering: ${url}`);
                return node_fetch_1.default(url);
            }));
        });
    }
    _getTranslationInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Fetching translation info');
            return yield node_fetch_1.default(`${this.repoUrl}/tree?path=${this.folder}`, { headers: { 'Private-Token': this.token } });
        });
    }
    _timeout(duration) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Waiting ${duration / 1000} seconds for POE to commit changes`);
            return yield new Promise((resolve) => setTimeout(resolve, duration));
        });
    }
    _fetchTranslations(data) {
        var data_1, data_1_1;
        var e_1, _a;
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Downloading translations');
            try {
                for (data_1 = __asyncValues(data); data_1_1 = yield data_1.next(), !data_1_1.done;) {
                    const el = data_1_1.value;
                    const fileUrl = el.path.replace('/', '%2F');
                    const file = yield node_fetch_1.default(`${this.repoUrl}/files/${fileUrl}/raw?ref=master`, { headers: { 'Private-Token': this.token } });
                    const fileDownloadPath = `${process.cwd()}/${this.downloadPath}`;
                    fs.mkdirSync(fileDownloadPath, { recursive: true });
                    fs.writeFileSync(`${fileDownloadPath}/${el.name}`, yield file.buffer());
                    console.log(`${el.name} saved`);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (data_1_1 && !data_1_1.done && (_a = data_1.return)) yield _a.call(data_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        });
    }
}
exports.Fetcher = Fetcher;
//# sourceMappingURL=fetcher.js.map