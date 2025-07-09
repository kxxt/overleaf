import { diagnosticCount, forceLinting, forEachDiagnostic } from '@codemirror/lint'
import {
  LanguageDescription,
  syntaxTree,
} from '@codemirror/language'
import { languages as codeLanguages } from '@codemirror/language-data'
import { python as pythonLanguage } from '@codemirror/lang-python'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { classHighlighter, highlightTree } from '@lezer/highlight'
import { expect } from 'chai'
import { typst } from '../../../../../../frontend/js/features/source-editor/languages/typst'

const python = LanguageDescription.matchLanguageName(codeLanguages, 'python')

const makeState = (doc: string) =>
  EditorState.create({
    doc,
    extensions: [typst()],
  })

describe('CodeMirror Typst language support', function () {
  before(function () {
    if (!python) {
      throw new Error('Python is missing from CodeMirror language data')
    }

    python.support = pythonLanguage()
  })

  it('uses the package linter for Typst syntax errors', async function () {
    const view = new EditorView({ state: makeState('#let value =') })

    forceLinting(view)
    await Promise.resolve()

    expect(diagnosticCount(view.state)).to.equal(1)

    const diagnostics: Array<{ source?: string; message: string }> = []
    forEachDiagnostic(view.state, diagnostic => {
      diagnostics.push(diagnostic)
    })

    expect(diagnostics).to.deep.equal([
      {
        from: 12,
        to: 12,
        severity: 'error',
        source: 'Typst syntax',
        message: 'Expected an expression after `=`.',
      },
    ])

    view.destroy()
  })

  it('highlights raw blocks with an official CodeMirror language', function () {
    const doc = '```python\ndef value():\n    return True\n```'
    const highlights: Array<[string, string]> = []

    highlightTree(
      syntaxTree(makeState(doc)),
      classHighlighter,
      (from, to, classes) => {
        highlights.push([doc.slice(from, to), classes])
      }
    )

    expect(highlights).to.deep.include(['def', 'tok-keyword'])
    expect(highlights).to.deep.include([
      'value',
      'tok-variableName tok-definition',
    ])
    expect(highlights).to.deep.include(['True', 'tok-bool'])
  })

  it('leaves unknown raw-block languages as Typst raw text', function () {
    const doc = '```not-a-language\nconst value = true\n```'
    const node = syntaxTree(makeState(doc)).resolveInner(
      doc.indexOf('const') + 1,
      1
    )

    expect(node.name).to.equal('Text')
    expect(node.parent?.name).to.equal('Raw')
  })
})
