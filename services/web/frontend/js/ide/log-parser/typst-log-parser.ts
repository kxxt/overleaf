const HUMAN_DIAGNOSTIC_REGEX = /^(error|warning):\s*(.*)$/i
const SHORT_DIAGNOSTIC_REGEX =
  /^(.+):(\d+):(\d+):\s*(error|warning):\s*(.*)$/i
const SOURCE_LOCATION_REGEX =
  /^\s*(?:(?:[┌╭][─━])|-->)\s*(.+):(\d+):(\d+)\s*$/u
const WRAPPER_LINE_REGEX =
  /^(?:Using (?:manually selected typst|default typst)|Typst failed with exit code\b)/
const ANSI_ESCAPE_REGEX = new RegExp(
  `${String.fromCharCode(27)}\\[[0-?]*[ -/]*[@-~]`,
  'g'
)

export type TypstLogEntry = {
  line: number | null
  column?: number
  file?: string
  level: 'error' | 'warning'
  message: string
  content?: string
  raw: string
}

export type TypstParseResult = {
  all: TypstLogEntry[]
  errors: TypstLogEntry[]
  warnings: TypstLogEntry[]
  typesetting: []
  files: []
}

type DiagnosticStart = {
  level: TypstLogEntry['level']
  message: string
  file?: string
  line?: number
  column?: number
}

const parseDiagnosticStart = (line: string): DiagnosticStart | null => {
  const shortMatch = line.match(SHORT_DIAGNOSTIC_REGEX)
  if (shortMatch) {
    return {
      file: shortMatch[1],
      line: Number(shortMatch[2]),
      column: Number(shortMatch[3]),
      level: shortMatch[4].toLowerCase() as TypstLogEntry['level'],
      message: shortMatch[5],
    }
  }

  const humanMatch = line.match(HUMAN_DIAGNOSTIC_REGEX)
  if (humanMatch) {
    return {
      level: humanMatch[1].toLowerCase() as TypstLogEntry['level'],
      message: humanMatch[2],
    }
  }

  return null
}

export default class TypstLogParser {
  private readonly text: string

  constructor(text: string) {
    if (typeof text !== 'string') {
      throw new Error('TypstLogParser Error: text parameter must be a string')
    }

    this.text = text
      .replace(/(?:\r\n)|\r/g, '\n')
      .replace(ANSI_ESCAPE_REGEX, '')
  }

  parse(): TypstParseResult {
    const lines = this.text.split('\n')
    const all: TypstLogEntry[] = []

    for (let index = 0; index < lines.length; ) {
      const start = parseDiagnosticStart(lines[index])
      if (!start) {
        index++
        continue
      }

      const diagnosticLines = [lines[index]]
      index++

      while (index < lines.length) {
        const line = lines[index]
        if (
          line.trim() === '' ||
          WRAPPER_LINE_REGEX.test(line) ||
          parseDiagnosticStart(line)
        ) {
          break
        }

        diagnosticLines.push(line)
        index++
      }

      let { file, line, column } = start
      if (!file) {
        for (const detailLine of diagnosticLines.slice(1)) {
          const location = detailLine.match(SOURCE_LOCATION_REGEX)
          if (location) {
            file = location[1]
            line = Number(location[2])
            column = Number(location[3])
            break
          }
        }
      }

      const content = diagnosticLines.slice(1).join('\n')
      all.push({
        line: line ?? null,
        column,
        file,
        level: start.level,
        message: start.message,
        content: content || undefined,
        raw: diagnosticLines.join('\n'),
      })
    }

    return {
      all,
      errors: all.filter(entry => entry.level === 'error'),
      warnings: all.filter(entry => entry.level === 'warning'),
      typesetting: [],
      files: [],
    }
  }
}
