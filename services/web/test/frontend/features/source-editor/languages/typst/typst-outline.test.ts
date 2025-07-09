import { EditorState, Text } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { expect } from 'chai'
import { typst } from '../../../../../../frontend/js/features/source-editor/languages/typst'
import { documentOutline } from '../../../../../../frontend/js/features/source-editor/languages/latex/document-outline'
import { FlatOutline } from '../../../../../../frontend/js/features/source-editor/utils/tree-query'

const makeView = (lines: string[]): EditorView =>
  new EditorView({
    state: EditorState.create({
      doc: Text.of(lines),
      extensions: [typst()],
    }),
  })

const getOutline = (view: EditorView): FlatOutline =>
  view.state.field(documentOutline).items

describe('CodeMirror Typst file outline', function () {
  it('extracts headings and their nesting levels', function () {
    const view = makeView([
      '= First',
      'body',
      '== *Strong* and _emphasized_ @reference',
    ])

    expect(getOutline(view)).to.deep.equal([
      {
        from: 0,
        to: 7,
        line: 1,
        toLine: 1,
        level: 1,
        title: 'First',
      },
      {
        from: 13,
        to: 52,
        line: 3,
        toLine: 3,
        level: 2,
        title: 'Strong and emphasized ',
      },
    ])

    view.destroy()
  })

  it('updates a heading after replacing its title', function () {
    const view = makeView(['= First', '', '== Second'])

    view.dispatch({
      changes: { from: 2, to: 7, insert: 'Updated' },
    })

    expect(getOutline(view)).to.deep.equal([
      {
        from: 0,
        to: 9,
        line: 1,
        toLine: 1,
        level: 1,
        title: 'Updated',
      },
      {
        from: 11,
        to: 20,
        line: 3,
        toLine: 3,
        level: 2,
        title: 'Second',
      },
    ])

    view.destroy()
  })

  it('updates a heading after changing its marker', function () {
    const view = makeView(['= First', '', '= Second'])

    view.dispatch({
      changes: { from: 0, to: 1, insert: '===' },
    })

    expect(getOutline(view)).to.deep.equal([
      {
        from: 0,
        to: 9,
        line: 1,
        toLine: 1,
        level: 3,
        title: 'First',
      },
      {
        from: 11,
        to: 19,
        line: 3,
        toLine: 3,
        level: 1,
        title: 'Second',
      },
    ])

    view.destroy()
  })

  it('removes a heading after deleting its marker', function () {
    const view = makeView(['= First', '', '= Second'])

    view.dispatch({
      changes: { from: 0, to: 2 },
    })

    expect(getOutline(view)).to.deep.equal([
      {
        from: 7,
        to: 15,
        line: 3,
        toLine: 3,
        level: 1,
        title: 'Second',
      },
    ])

    view.destroy()
  })

  it('keeps a heading after deleting its entire title', function () {
    const view = makeView(['= First', '', '== Second'])

    view.dispatch({
      changes: { from: 2, to: 7 },
    })

    expect(getOutline(view)).to.deep.equal([
      {
        from: 0,
        to: 1,
        line: 1,
        toLine: 1,
        level: 1,
        title: '',
      },
      {
        from: 4,
        to: 13,
        line: 3,
        toLine: 3,
        level: 2,
        title: 'Second',
      },
    ])

    view.destroy()
  })

  it('matches a fresh outline after incremental edits', function () {
    const initial = '= First\nbody\n== Second\nbody\n=== Third'
    const changes = [
      { from: 0, to: 0, insert: '=' },
      { from: 1, to: 1, insert: '=' },
      { from: 2, to: 2, insert: '=' },
      { from: 2, to: 2, insert: 'updated ' },
      { from: 7, to: 7, insert: ' updated' },
      { from: 7, to: 7, insert: '\n' },
      { from: 0, to: 1, insert: '' },
      { from: 0, to: 2, insert: '' },
      { from: 2, to: 7, insert: '' },
      { from: 0, to: 7, insert: '= Replacement' },
      { from: 13, to: 13, insert: '=' },
      { from: 13, to: 14, insert: '' },
      { from: 13, to: 15, insert: '' },
      { from: 16, to: 22, insert: 'Changed' },
      { from: 23, to: 23, insert: '\n= Inserted' },
    ]

    for (const change of changes) {
      const view = makeView(initial.split('\n'))
      view.dispatch({ changes: change })
      const freshView = makeView(view.state.doc.toString().split('\n'))
      expect(getOutline(view), JSON.stringify(change)).to.deep.equal(
        getOutline(freshView)
      )
      view.destroy()
      freshView.destroy()
    }
  })
})
