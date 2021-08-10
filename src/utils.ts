import * as core from '@actions/core'
import * as fs from 'fs'
import * as fspath from 'path'
import * as github from '@actions/github'

export const gitRefRegex = /^refs\/(:?heads|tags)\//

export function directoryExist(path: string, followSymLinks = true): boolean {
  return (
    pathExists(path, followSymLinks) &&
    // @ts-ignore
    safeStat(path, followSymLinks).isDirectory()
  )
}

export function fileExist(path: string, followSymLinks = true): boolean {
  return (
    pathExists(path, followSymLinks) &&
    // @ts-ignore
    (safeStat(path, followSymLinks).isFile() || safeStat(path, followSymLinks).isSymbolicLink())
  )
}

export function getGitRef(): string {
  if (!github.context.ref.match(gitRefRegex)) {
    throw new Error(`Invalid git ref: ${github.context.ref}`)
  }

  return github.context.ref.replace(gitRefRegex, '')
}

export function getInputAsArray(name: string, options?: core.InputOptions): string[] {
  return core
    .getMultilineInput(name, options)
    .map(x =>
      x
        .split(',')
        .map(s => s.trim())
        .filter(s => s !== '')
    )
    .flat()
}

/**
 * @deprecated Just use core.getBooleanInput() instead
 */
export function getInputAsBool(name: string, options?: core.InputOptions): boolean {
  return core.getBooleanInput(name, options)
}

/**
 * @deprecated Just use core.getInput() instead
 */
export function getInputAsString(name: string, options?: core.InputOptions): string {
  return core.getInput(name, options)
}

export function getPathLock(path: string): (() => void) | undefined {
  const lockFile = `${path}.lock`

  if (fileExist(lockFile)) {
    return undefined
  }

  const parentDir = fspath.dirname(path)
  if (!pathExists(parentDir)) {
    fs.mkdirSync(parentDir, {recursive: true})
  }

  fs.openSync(lockFile, 'w')

  return function () {
    fs.unlinkSync(lockFile)
  }
}

export function gitBranchIsLatest(latestName = 'master'): boolean {
  return github.context.ref === `refs/heads/${latestName}`
}

export function gitEventIsPushHead(): boolean {
  return github.context.eventName === 'push' && !!github.context.ref.match(/^refs\/heads\//)
}

export function gitEventIsPushTag(): boolean {
  return github.context.eventName === 'push' && !!github.context.ref.match(/^refs\/tags\//)
}

export function okPath(path: string): void {
  const parentDir = fspath.dirname(path)
  if (!pathExists(parentDir)) {
    fs.mkdirSync(parentDir, {recursive: true})
  }

  fs.openSync(`${path}.ok`, 'w')
}

export function pathIsLocked(path: string): boolean {
  return fileExist(`${path}.lock`)
}

export function pathIsOk(path: string): boolean {
  return fileExist(`${path}.ok`)
}

export function pathExists(path: string, followSymLinks = true): boolean {
  return safeStat(path, followSymLinks) !== undefined
}

export function safeStat(path: string, followSymLinks = true): fs.Stats | undefined {
  let statFunc = fs.statSync
  if (!followSymLinks) {
    statFunc = fs.lstatSync
  }

  try {
    return statFunc(path)
  } catch (error) {
    if (error.code === 'ENOENT') {
      return undefined
    }

    throw error
  }
}

export function setTimer(millis: number, message?: string): ReturnType<typeof setTimeout> {
  return setTimeout(function () {
    core.setFailed(message ?? 'Timer expired, aborting')
    process.exit(1)
  }, millis)
}

export function sleep(millis: number): void {
  const limit = new Date(new Date().getTime() + millis)
  // eslint-disable-next-line no-empty
  while (new Date() <= limit) {}
}

export async function waitForPathLock(path: string, millis: number): Promise<void> {
  return new Promise(function (resolve, reject) {
    const timeout = setTimeout(function () {
      clearTimeout(timeout)
      clearInterval(interval)
      reject(new Error(`ETOUT: Timed out waiting for lock on path "${path}"`))
    }, millis)

    const interval = setInterval(function () {
      if (!pathIsLocked(path)) {
        clearTimeout(timeout)
        clearInterval(interval)
        resolve()
      }
      core.debug(`Waiting for lock on path "${path}"`)
    }, 1000)

    if (!pathIsLocked(path)) {
      clearTimeout(timeout)
      clearInterval(interval)
      resolve()
    }
  })
}
