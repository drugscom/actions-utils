"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForPathLock = exports.sleep = exports.setTimer = exports.safeStat = exports.pathExists = exports.pathIsOk = exports.pathIsLocked = exports.okPath = exports.gitEventIsPushTag = exports.gitEventIsPushHead = exports.gitBranchIsLatest = exports.getPathLock = exports.getInputAsString = exports.getInputAsBool = exports.getInputAsArray = exports.getGitRef = exports.fileExist = exports.directoryExist = exports.gitRefTagRegex = exports.gitRefHeadRegex = exports.gitRefRegex = void 0;
const core = __importStar(require("@actions/core"));
const fs = __importStar(require("fs"));
const fspath = __importStar(require("path"));
const github = __importStar(require("@actions/github"));
exports.gitRefRegex = /^refs\/(:?heads|tags)\//;
exports.gitRefHeadRegex = /^refs\/heads\//;
exports.gitRefTagRegex = /^refs\/tags\//;
function directoryExist(path, followSymLinks = true) {
    if (!pathExists(path, followSymLinks)) {
        return false;
    }
    const pathStat = safeStat(path, followSymLinks);
    if (!pathStat) {
        return false;
    }
    return pathStat.isDirectory();
}
exports.directoryExist = directoryExist;
function fileExist(path, followSymLinks = true) {
    if (!pathExists(path, followSymLinks)) {
        return false;
    }
    const pathStat = safeStat(path, followSymLinks);
    if (!pathStat) {
        return false;
    }
    return pathStat.isFile() || pathStat.isSymbolicLink();
}
exports.fileExist = fileExist;
function getGitRef() {
    if (!github.context.ref.match(exports.gitRefRegex)) {
        throw new Error(`Invalid git ref: ${github.context.ref}`);
    }
    return github.context.ref.replace(exports.gitRefRegex, '');
}
exports.getGitRef = getGitRef;
function getInputAsArray(name, options) {
    return core
        .getMultilineInput(name, options)
        .map(x => x
        .split(',')
        .map(s => s.trim())
        .filter(s => s !== ''))
        .flat();
}
exports.getInputAsArray = getInputAsArray;
/**
 * @deprecated Just use core.getBooleanInput() instead
 */
function getInputAsBool(name, options) {
    return core.getBooleanInput(name, options);
}
exports.getInputAsBool = getInputAsBool;
/**
 * @deprecated Just use core.getInput() instead
 */
function getInputAsString(name, options) {
    return core.getInput(name, options);
}
exports.getInputAsString = getInputAsString;
function getPathLock(path) {
    const lockFile = `${path}.lock`;
    if (fileExist(lockFile)) {
        return undefined;
    }
    const parentDir = fspath.dirname(path);
    if (!pathExists(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.openSync(lockFile, 'w');
    return function () {
        fs.unlinkSync(lockFile);
    };
}
exports.getPathLock = getPathLock;
function gitBranchIsLatest(latestName = 'master') {
    return github.context.ref === `refs/heads/${latestName}`;
}
exports.gitBranchIsLatest = gitBranchIsLatest;
function gitEventIsPushHead() {
    return github.context.eventName === 'push' && github.context.ref.startsWith('refs/heads/');
}
exports.gitEventIsPushHead = gitEventIsPushHead;
function gitEventIsPushTag() {
    return github.context.eventName === 'push' && github.context.ref.startsWith('refs/tags/');
}
exports.gitEventIsPushTag = gitEventIsPushTag;
function okPath(path) {
    const parentDir = fspath.dirname(path);
    if (!pathExists(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.openSync(`${path}.ok`, 'w');
}
exports.okPath = okPath;
function pathIsLocked(path) {
    return fileExist(`${path}.lock`);
}
exports.pathIsLocked = pathIsLocked;
function pathIsOk(path) {
    return fileExist(`${path}.ok`);
}
exports.pathIsOk = pathIsOk;
function pathExists(path, followSymLinks = true) {
    return safeStat(path, followSymLinks) !== undefined;
}
exports.pathExists = pathExists;
function safeStat(path, followSymLinks = true) {
    let statFunc = fs.statSync;
    if (!followSymLinks) {
        statFunc = fs.lstatSync;
    }
    try {
        return statFunc(path);
    }
    catch (error) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (error.code === 'ENOENT') {
            return undefined;
        }
        throw error;
    }
}
exports.safeStat = safeStat;
function setTimer(millis, message) {
    return setTimeout(function () {
        core.setFailed(message !== null && message !== void 0 ? message : 'Timer expired, aborting');
        process.exit(1);
    }, millis);
}
exports.setTimer = setTimer;
function sleep(millis) {
    const limit = new Date(new Date().getTime() + millis);
    // eslint-disable-next-line no-empty
    while (new Date() <= limit) { }
}
exports.sleep = sleep;
function waitForPathLock(path, millis) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(function (resolve, reject) {
            const timeout = setTimeout(function () {
                clearTimeout(timeout);
                clearInterval(interval);
                reject(new Error(`ETOUT: Timed out waiting for lock on path "${path}"`));
            }, millis);
            const interval = setInterval(function () {
                if (!pathIsLocked(path)) {
                    clearTimeout(timeout);
                    clearInterval(interval);
                    resolve();
                }
                core.debug(`Waiting for lock on path "${path}"`);
            }, 1000);
            if (!pathIsLocked(path)) {
                clearTimeout(timeout);
                clearInterval(interval);
                resolve();
            }
        });
    });
}
exports.waitForPathLock = waitForPathLock;
//# sourceMappingURL=utils.js.map