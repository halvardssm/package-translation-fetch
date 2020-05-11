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
const index_1 = require("./index");
class Fetcher {
    constructor(options) {
        this.state = Object.assign(Object.assign({}, this.state), options);
        this.apiUrl = this._parseApiUrl();
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fileRegExp = RegExp('[a-z_-]+.json');
                console.info("Starting translation fetch");
                const translationInfoRaw = yield this._getTranslationInfo();
                yield this._triggerHooks();
                yield this._timeout(10000);
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
    _fetch(url, appendHeader = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let headers;
            if (this.state.token && appendHeader) {
                let headerToken;
                switch (this.state.host) {
                    case index_1.GIT_HOST_GITHUB:
                        headerToken = { 'Authorization': `token ${this.state.token}` };
                    case index_1.GIT_HOST_GITLAB:
                        headerToken = { 'Private-Token': this.state.token };
                }
                headers = { headers: headerToken };
            }
            const result = yield node_fetch_1.default(url, headers);
            if (result.status !== 200)
                throw new Error(`Fetch failed:\n${url}\n${yield result.text()}`);
            return result;
        });
    }
    _parseApiUrl() {
        switch (this.state.host) {
            case index_1.GIT_HOST_GITHUB:
                return 'https://api.github.com/repos';
            case index_1.GIT_HOST_GITLAB:
                return 'https://gitlab.com/api/v4/projects';
            default:
                throw new Error('Git host not supported');
        }
    }
    _urlSwitch(options) {
        return options[this.state.host];
    }
    _triggerHooks() {
        return __awaiter(this, void 0, void 0, function* () {
            console.info('Triggering Hooks');
            yield Promise.all(this.state.hooks.split(' ').map((el) => {
                const url = `https://api.poeditor.com/webhooks/${el}`;
                return this._fetch(url);
            }));
        });
    }
    _timeout(duration) {
        return __awaiter(this, void 0, void 0, function* () {
            console.info(`Waiting ${duration / 1000} seconds for POEditor to commit changes`);
            return yield new Promise((resolve) => setTimeout(resolve, duration));
        });
    }
    _getTranslationInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            console.info('Fetching translation info');
            let append = this._urlSwitch({ gitlab: `/repository/tree?path=${this.state.folder}`, github: `/contents/${this.state.folder}` });
            return yield this._fetch(`${this.apiUrl}/${this.state.repo}${append}`, true);
        });
    }
    _parseContent(file) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (this.state.host) {
                case index_1.GIT_HOST_GITLAB:
                    return yield file.buffer();
                case index_1.GIT_HOST_GITHUB:
                    const content = yield file.json();
                    return content.content;
                default:
                    return yield file.json();
            }
        });
    }
    _fetchTranslations(data) {
        var data_1, data_1_1;
        var e_1, _a;
        return __awaiter(this, void 0, void 0, function* () {
            console.info('Downloading translations');
            try {
                for (data_1 = __asyncValues(data); data_1_1 = yield data_1.next(), !data_1_1.done;) {
                    const el = data_1_1.value;
                    const fileUrl = el.path.replace('/', '%2F');
                    let append = this._urlSwitch({ gitlab: `/repository/files/${fileUrl}/raw?ref=master`, github: `/contents/${fileUrl}` });
                    const file = yield this._fetch(`${this.apiUrl}/${this.state.repo}${append}`, true);
                    const content = yield this._parseContent(file);
                    const fileDownloadPath = `${process.cwd()}/${this.state.path}`;
                    fs.mkdirSync(fileDownloadPath, { recursive: true });
                    fs.writeFileSync(`${fileDownloadPath}/${el.name}`, content);
                    console.info(`${el.name} saved`);
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