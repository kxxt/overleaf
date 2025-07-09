import {
  CompletionContext,
  CompletionResult,
  CompletionSource,
} from '@codemirror/autocomplete'
import { EditorState } from '@codemirror/state'
import { expect } from 'chai'
import { metadataState, Metadata } from '../../../../../../frontend/js/features/source-editor/extensions/language'
import { typstCitationCompletionSource } from '../../../../../../frontend/js/features/source-editor/languages/typst/complete'
import { typst } from '../../../../../../frontend/js/features/source-editor/languages/typst'

const referenceKeys = new Set(['smith-2024', 'doe:results', 'other.key'])

const makeState = (doc: string) =>
  EditorState.create({
    doc,
    extensions: [
      typst(),
      metadataState.init(
        () =>
          ({
            referenceKeys,
          }) as Metadata
      ),
    ],
  })

const complete = (
  markedDoc: string,
  explicit = false
): CompletionResult | null => {
  const pos = markedDoc.indexOf('|')
  if (pos === -1) {
    throw new Error('missing cursor marker')
  }

  const state = makeState(markedDoc.slice(0, pos) + markedDoc.slice(pos + 1))
  const result = typstCitationCompletionSource(
    new CompletionContext(state, pos, explicit)
  )

  if (result instanceof Promise) {
    throw new Error('expected synchronous completions')
  }

  return result
}

describe('CodeMirror Typst citation autocomplete', function () {
  it('offers project references after a reference marker', function () {
    const result = complete('See @|')

    expect(result?.from).to.equal(5)
    expect(result?.options.map(option => option.label)).to.deep.equal([
      'smith-2024',
      'doe:results',
      'other.key',
    ])
    expect(result?.options.every(option => option.type === 'reference')).to.be
      .true
    expect(result?.options.every(option => option.extend === undefined)).to.be
      .true
  })

  it('replaces only the partially typed citation key', function () {
    const result = complete('See @smi|')

    expect(result?.from).to.equal(5)
    expect(result?.validFor).to.deep.equal(/^[\p{ID_Continue}_\-:.]*$/u)
  })

  it('does not offer citations without a reference marker', function () {
    expect(complete('See smi|', true)).to.be.null
  })

  for (const [description, doc] of [
    ['raw text', '`@smi|`'],
    ['strings', '#let value = "@smi|"'],
    ['line comments', '// @smi|'],
    ['block comments', '/* @smi| */'],
    ['math', '$@smi|$'],
  ]) {
    it(`does not offer citations in ${description}`, function () {
      expect(complete(doc)).to.be.null
    })
  }

  it('registers the citation source alongside Typst built-in completions', function () {
    const state = makeState('@')
    const completionSources = state.languageDataAt<CompletionSource>(
      'autocomplete',
      1
    )

    expect(completionSources).to.include(typstCitationCompletionSource)
    expect(completionSources.length).to.be.greaterThan(1)
  })
})
