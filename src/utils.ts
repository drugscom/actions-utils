import * as core from '@actions/core'
import * as github from '@actions/github'
import * as fs from 'fs'

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
    .getInput(name, options)
    .split('\n')
    .map(x =>
      x
        .split(',')
        .map(s => s.trim())
        .filter(s => s !== '')
    )
    .flat()
}

export function getInputAsBool(name: string, options?: core.InputOptions): boolean {
  return core.getInput(name, options).trim().toUpperCase() === 'TRUE'
}

export function getInputAsString(name: string, options?: core.InputOptions): string {
  return core.getInput(name, options).trim()
}

export function getPathLock(path: string): (() => void) | undefined {
  const lockFile = `${path}.lock`

  if (fileExist(lockFile)) {
    return undefined
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

export function sleep(millis: number): void {
  const limit = new Date(new Date().getTime() + millis)
  // eslint-disable-next-line no-empty
  while (new Date() <= limit) {}
}
