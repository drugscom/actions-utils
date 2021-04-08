"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = exports.setTimer = exports.safeStat = exports.pathExists = exports.pathIsOk = exports.pathIsLocked = exports.okPath = exports.gitEventIsPushTag = exports.gitEventIsPushHead = exports.gitBranchIsLatest = exports.getPathLock = exports.getInputAsString = exports.getInputAsBool = exports.getInputAsArray = exports.getGitRef = exports.fileExist = exports.directoryExist = exports.gitRefRegex = void 0;
const core = __importStar(require("@actions/core"));
const fs = __importStar(require("fs"));
const fspath = __importStar(require("path"));
const github = __importStar(require("@actions/github"));
exports.gitRefRegex = /^refs\/(:?heads|tags)\//;
function directoryExist(path, followSymLinks = true) {
    return (pathExists(path, followSymLinks) &&
        // @ts-ignore
        safeStat(path, followSymLinks).isDirectory());
}
exports.directoryExist = directoryExist;
function fileExist(path, followSymLinks = true) {
    return (pathExists(path, followSymLinks) &&
        // @ts-ignore
        (safeStat(path, followSymLinks).isFile() || safeStat(path, followSymLinks).isSymbolicLink()));
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
        .getInput(name, options)
        .split('\n')
        .map(x => x
        .split(',')
        .map(s => s.trim())
        .filter(s => s !== ''))
        .flat();
}
exports.getInputAsArray = getInputAsArray;
function getInputAsBool(name, options) {
    return core.getInput(name, options).trim().toUpperCase() === 'TRUE';
}
exports.getInputAsBool = getInputAsBool;
function getInputAsString(name, options) {
    return core.getInput(name, options).trim();
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
    return github.context.eventName === 'push' && !!github.context.ref.match(/^refs\/heads\//);
}
exports.gitEventIsPushHead = gitEventIsPushHead;
function gitEventIsPushTag() {
    return github.context.eventName === 'push' && !!github.context.ref.match(/^refs\/tags\//);
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
//# sourceMappingURL=utils.js.map