/// <reference types="node" />
import * as core from '@actions/core';
import * as fs from 'fs';
export declare const gitRefRegex: RegExp;
export declare const gitRefHeadRegex: RegExp;
export declare const gitRefTagRegex: RegExp;
export declare function directoryExist(path: string, followSymLinks?: boolean): boolean;
export declare function fileExist(path: string, followSymLinks?: boolean): boolean;
export declare function getGitRef(): string;
export declare function getInputAsArray(name: string, options?: core.InputOptions): string[];
/**
 * @deprecated Just use core.getBooleanInput() instead
 */
export declare function getInputAsBool(name: string, options?: core.InputOptions): boolean;
/**
 * @deprecated Just use core.getInput() instead
 */
export declare function getInputAsString(name: string, options?: core.InputOptions): string;
export declare function getPathLock(path: string): (() => void) | undefined;
export declare function gitBranchIsLatest(latestName?: string): boolean;
export declare function gitEventIsPushHead(): boolean;
export declare function gitEventIsPushTag(): boolean;
export declare function okPath(path: string): void;
export declare function pathIsLocked(path: string): boolean;
export declare function pathIsOk(path: string): boolean;
export declare function pathExists(path: string, followSymLinks?: boolean): boolean;
export declare function safeStat(path: string, followSymLinks?: boolean): fs.Stats | undefined;
export declare function setTimer(millis: number, message?: string): ReturnType<typeof setTimeout>;
export declare function sleep(millis: number): void;
export declare function waitForPathLock(path: string, millis: number): Promise<void>;
