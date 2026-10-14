import React from 'react'
import { act, cleanup, renderHook, screen } from '@testing-library/react'
import { expect } from 'chai'
import fetchMock from 'fetch-mock'
import sinon from 'sinon'
import { useRootDoc } from '@/shared/hooks/use-root-doc'
import { useFileTreeData } from '@/shared/context/file-tree-data-context'
import { useProjectContext } from '@/shared/context/project-context'
import { useLocalCompileContext } from '@/shared/context/local-compile-context'
import { useProjectSettingsContext } from '@/features/editor-left-menu/context/project-settings-context'
import RootDocumentSetting from '@/features/settings/components/compiler-settings/root-document-setting'
import { SettingsModalProvider } from '@/features/settings/context/settings-modal-context'
import { EditorProviders } from '../../helpers/editor-providers'
import { Folder } from '../../../../types/folder'
import { ProjectCompiler } from '../../../../types/project-settings'

describe('useRootDoc', function () {
  const rootFolder: Folder = {
    _id: 'root-folder-id',
    name: 'rootFolder',
    docs: [
      { _id: 'original-main-doc-id', name: 'main.typ' },
      { _id: 'latex-doc-id', name: 'main.tex' },
    ],
    fileRefs: [],
    folders: [
      {
        _id: 'nested-folder-id',
        name: 'nested',
        docs: [{ _id: 'custom-root-doc-id', name: 'report.typ' }],
        fileRefs: [],
        folders: [],
      },
    ],
  }

  function renderRootDoc({
    compiler = 'typst',
    rootDocId = 'original-main-doc-id',
    scope,
    folder = rootFolder,
    showSettings = false,
  }: {
    compiler?: ProjectCompiler
    rootDocId?: string
    scope?: Record<string, any>
    folder?: Folder
    showSettings?: boolean
  } = {}) {
    return renderHook(
      () => ({
        getRootDocInfo: useRootDoc(),
        ...useFileTreeData(),
        ...useProjectContext(),
        settingsRootDocId: useProjectSettingsContext().rootDocId,
        startCompile: useLocalCompileContext().startCompile,
      }),
      {
        wrapper: ({ children }) => (
          <EditorProviders
            compiler={compiler}
            rootDocId={rootDocId}
            rootFolder={[folder]}
            scope={scope}
          >
            <SettingsModalProvider>
              {showSettings && <RootDocumentSetting />}
              {children}
            </SettingsModalProvider>
          </EditorProviders>
        ),
      }
    )
  }

  let preventCompileOnLoad: boolean | undefined
  let exposedSettings: typeof window.metaAttributesCache

  beforeEach(function () {
    preventCompileOnLoad = window.metaAttributesCache.get(
      'ol-preventCompileOnLoad'
    )
    window.metaAttributesCache.set('ol-preventCompileOnLoad', true)
    exposedSettings = window.metaAttributesCache.get('ol-ExposedSettings')
    window.metaAttributesCache.set('ol-ExposedSettings', {
      ...exposedSettings,
      validRootDocExtensions: ['tex', 'Rtex', 'Rnw', 'typ'],
    })
  })

  afterEach(function () {
    cleanup()
    sinon.restore()
    fetchMock.removeRoutes().clearHistory()
    window.metaAttributesCache.set('ol-ExposedSettings', exposedSettings)
    window.metaAttributesCache.set(
      'ol-preventCompileOnLoad',
      preventCompileOnLoad
    )
  })

  it('uses the new document ID after deleting and recreating main.typ', function () {
    const { result } = renderRootDoc({
      folder: { ...rootFolder, folders: [] },
    })

    expect(result.current.getRootDocInfo()).to.deep.equal({
      rootDocId: 'original-main-doc-id',
      rootResourcePath: 'main.typ',
    })

    act(() => result.current.dispatchDelete('original-main-doc-id'))

    expect(result.current.getRootDocInfo()).to.deep.equal({
      rootDocId: null,
      rootResourcePath: 'main.typ',
    })

    act(() =>
      result.current.dispatchCreateDoc('root-folder-id', {
        _id: 'recreated-main-doc-id',
        name: 'main.typ',
      })
    )

    expect(result.current.getRootDocInfo()).to.deep.equal({
      rootDocId: 'recreated-main-doc-id',
      rootResourcePath: 'main.typ',
    })
  })

  it('compiles test.typ and shows it in settings after deleting main.typ and compiling with no main document', async function () {
    // The test bootstrap combines jsdom's AbortController with Node's AbortSignal.
    sinon.stub(AbortSignal, 'any').callsFake(signals => Array.from(signals)[0])
    fetchMock.post('express:/project/:projectId/compile', {
      status: 'success',
      outputFiles: [],
    })
    const { result } = renderRootDoc({
      folder: { ...rootFolder, folders: [] },
      showSettings: true,
    })

    act(() => result.current.dispatchDelete('original-main-doc-id'))
    await act(async () => result.current.startCompile({}))

    act(() =>
      result.current.dispatchCreateDoc('root-folder-id', {
        _id: 'test-doc-id',
        name: 'test.typ',
      })
    )

    expect(result.current.getRootDocInfo()).to.deep.equal({
      rootDocId: 'test-doc-id',
      rootResourcePath: 'test.typ',
    })
    expect(result.current.settingsRootDocId).to.equal('test-doc-id')
    expect(
      (
        screen.getByRole('combobox', {
          name: 'Main document',
        }) as HTMLSelectElement
      ).value
    ).to.equal('test-doc-id')

    await act(async () => result.current.startCompile({}))

    const request = fetchMock.callHistory.lastCall()
    expect(JSON.parse(request?.options.body as string)).to.include({
      rootDoc_id: 'test-doc-id',
      rootResourcePath: 'test.typ',
    })
  })

  it('uses the nearest Typst document when the selected main document is missing', function () {
    const { result } = renderRootDoc({ rootDocId: 'deleted-doc-id' })
    act(() => result.current.dispatchDelete('original-main-doc-id'))
    act(() =>
      result.current.dispatchCreateDoc('root-folder-id', {
        _id: 'test-doc-id',
        name: 'test.typ',
      })
    )

    expect(result.current.getRootDocInfo()).to.deep.equal({
      rootDocId: 'test-doc-id',
      rootResourcePath: 'test.typ',
    })
    expect(result.current.settingsRootDocId).to.equal('test-doc-id')
  })

  it('recovers a nested Typst document without requiring a LaTeX documentclass', function () {
    const { result } = renderRootDoc()
    act(() => result.current.dispatchDelete('original-main-doc-id'))

    expect(result.current.getRootDocInfo()).to.deep.equal({
      rootDocId: 'custom-root-doc-id',
      rootResourcePath: 'nested/report.typ',
    })
    expect(result.current.settingsRootDocId).to.equal('custom-root-doc-id')
  })

  it('shows no main document when no Typst documents remain', function () {
    const { result } = renderRootDoc({
      folder: { ...rootFolder, folders: [] },
      showSettings: true,
    })
    act(() => result.current.dispatchDelete('original-main-doc-id'))

    expect(result.current.settingsRootDocId).to.be.undefined
    expect(
      (screen.getByRole('option', { name: 'None' }) as HTMLOptionElement)
        .selected
    ).to.be.true
    expect(result.current.getRootDocInfo()).to.deep.equal({
      rootDocId: null,
      rootResourcePath: 'main.typ',
    })
  })

  it('keeps an explicitly selected replacement when main.typ is recreated', function () {
    const { result } = renderRootDoc({ rootDocId: 'custom-root-doc-id' })
    act(() => result.current.dispatchDelete('original-main-doc-id'))
    act(() =>
      result.current.dispatchCreateDoc('root-folder-id', {
        _id: 'recreated-main-doc-id',
        name: 'main.typ',
      })
    )

    expect(result.current.getRootDocInfo()).to.deep.equal({
      rootDocId: 'custom-root-doc-id',
      rootResourcePath: 'nested/report.typ',
    })
    expect(result.current.settingsRootDocId).to.equal('custom-root-doc-id')
  })

  it('finds main.typ when the selected main document is missing', function () {
    const { result } = renderRootDoc({ rootDocId: 'deleted-doc-id' })

    expect(result.current.getRootDocInfo()).to.deep.equal({
      rootDocId: 'original-main-doc-id',
      rootResourcePath: 'main.typ',
    })
  })

  it('preserves an explicitly selected Typst main document in a subfolder', function () {
    const { result } = renderRootDoc({ rootDocId: 'custom-root-doc-id' })

    expect(result.current.getRootDocInfo()).to.deep.equal({
      rootDocId: 'custom-root-doc-id',
      rootResourcePath: 'nested/report.typ',
    })
  })

  it('keeps the selected Typst main document when an open file contains a LaTeX documentclass', function () {
    const { result } = renderRootDoc({
      scope: {
        editor: {
          sharejs_doc: {
            doc_id: 'latex-doc-id',
            getSnapshot: () => '\\documentclass{article}',
          },
        },
      },
    })

    expect(result.current.getRootDocInfo()).to.deep.equal({
      rootDocId: 'original-main-doc-id',
      rootResourcePath: 'main.typ',
    })
  })

  it('continues to compile an open LaTeX document containing a documentclass', function () {
    const { result } = renderRootDoc({
      compiler: 'pdflatex',
      rootDocId: 'deleted-doc-id',
      scope: {
        editor: {
          sharejs_doc: {
            doc_id: 'latex-doc-id',
            getSnapshot: () => '\\documentclass{article}',
          },
        },
      },
    })

    expect(result.current.getRootDocInfo()).to.deep.equal({
      rootDocId: 'latex-doc-id',
      rootResourcePath: 'main.tex',
    })
  })

  it('uses main.tex as the fallback for LaTeX projects', function () {
    const { result } = renderRootDoc({
      compiler: 'pdflatex',
      rootDocId: 'deleted-doc-id',
    })

    expect(result.current.getRootDocInfo()).to.deep.equal({
      rootDocId: 'latex-doc-id',
      rootResourcePath: 'main.tex',
    })

    act(() => result.current.dispatchDelete('latex-doc-id'))

    expect(result.current.getRootDocInfo()).to.deep.equal({
      rootDocId: null,
      rootResourcePath: 'main.tex',
    })
  })

  it('updates the fallback when the project compiler changes', function () {
    const { result } = renderRootDoc({
      compiler: 'pdflatex',
      rootDocId: 'deleted-doc-id',
    })

    act(() => result.current.updateProject({ compiler: 'typst' }))

    expect(result.current.getRootDocInfo()).to.deep.equal({
      rootDocId: 'original-main-doc-id',
      rootResourcePath: 'main.typ',
    })
  })
})
