import { EditorSelection } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { expect } from 'chai'
import {
  toggleTypstEmph,
  toggleTypstStrong,
} from '../../../../../../frontend/js/features/source-editor/extensions/toolbar/commands'
import { shortcuts } from '../../../../../../frontend/js/features/source-editor/languages/typst/shortcuts'

const applyShortcut = (key: string) => {
  const view = new EditorView({
    doc: 'content',
    selection: EditorSelection.range(0, 7),
    extensions: [shortcuts()],
  })
  const binding = view.state
    .facet(keymap)
    .flat()
    .find(candidate => candidate.key === key)

  expect(binding, `missing ${key} binding`).to.exist
  expect(binding!.run!(view)).to.equal(true)
  const output = view.state.doc.toString()
  view.destroy()
  return output
}

const applyToolbarCommand = (command: (view: EditorView) => boolean) => {
  const view = new EditorView({
    doc: 'content',
    selection: EditorSelection.range(0, 7),
  })

  expect(command(view)).to.equal(true)
  const output = view.state.doc.toString()
  view.destroy()
  return output
}

describe('Typst formatting shortcuts', function () {
  it('keeps Typst-required spaces around strong markup', function () {
    expect(applyShortcut('Ctrl-b')).to.equal(' *content* ')
    expect(applyToolbarCommand(toggleTypstStrong)).to.equal(' *content* ')
  })

  it('keeps Typst-required spaces around emphasis markup', function () {
    expect(applyShortcut('Ctrl-i')).to.equal(' _content_ ')
    expect(applyToolbarCommand(toggleTypstEmph)).to.equal(' _content_ ')
  })
})
