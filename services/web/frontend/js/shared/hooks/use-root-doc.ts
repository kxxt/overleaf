import { useCallback, useMemo } from 'react'
import { useProjectContext } from '@/shared/context/project-context'
import { useEditorOpenDocContext } from '@/features/ide-react/context/editor-open-doc-context'
import { useFileTreePathContext } from '@/features/file-tree/contexts/file-tree-path'
import { isMainFile } from '@/features/pdf-preview/util/editor-files'
import { useFileTreeData } from '@/shared/context/file-tree-data-context'
import { isValidTypFile } from '@/main/is-valid-tex-file'

export type RootDocInfo = {
  rootDocId: string | null
  rootResourcePath: string
}

// Typst has no documentclass marker. Keep the selected document while it exists,
// then prefer main.typ, followed by the nearest .typ document in path order.
export function useTypstRootDoc() {
  const { project } = useProjectContext()
  const isTypst = project?.compiler === 'typst'
  const rootDocId = project?.rootDocId
  const { docs } = useFileTreeData()

  return useMemo(() => {
    if (!isTypst) return

    const selectedDoc = docs?.find(doc => doc.doc.id === rootDocId)
    if (selectedDoc) return selectedDoc

    const candidates = docs
      ?.filter(doc => isValidTypFile(doc.path))
      .sort(
        (a, b) =>
          a.path.split('/').length - b.path.split('/').length ||
          a.path.localeCompare(b.path)
      )
    return candidates?.find(doc => doc.path === 'main.typ') ?? candidates?.[0]
  }, [isTypst, rootDocId, docs])
}

export function useRootDoc(): () => RootDocInfo {
  const { project } = useProjectContext()
  const projectRootDocId = project?.rootDocId ?? null
  const isTypst = project?.compiler === 'typst'
  const typstRootDoc = useTypstRootDoc()
  const { currentDocument } = useEditorOpenDocContext()
  const { pathInFolder, findEntityByPath } = useFileTreePathContext()

  // Inspecting the document content is too expensive to perform on every update.
  // Compute the rootDoc on-demand instead.
  return useCallback((): RootDocInfo => {
    if (isTypst) {
      return {
        rootDocId: typstRootDoc?.doc.id ?? null,
        rootResourcePath: typstRootDoc?.path ?? 'main.typ',
      }
    }

    let rootDocId: string | null = projectRootDocId
    if (
      currentDocument &&
      currentDocument.doc_id !== projectRootDocId &&
      isMainFile(currentDocument.getSnapshot())
    ) {
      rootDocId = currentDocument.doc_id
    }
    let rootResourcePath = rootDocId && pathInFolder(rootDocId)
    if (!rootResourcePath) {
      rootResourcePath = 'main.tex'
      // A recreated main document has a new ID. Resolve it from the current tree.
      const mainDoc = findEntityByPath(rootResourcePath)
      rootDocId = mainDoc?.type === 'doc' ? mainDoc.entity._id : null
    }
    return { rootDocId, rootResourcePath }
  }, [
    projectRootDocId,
    isTypst,
    typstRootDoc,
    currentDocument,
    pathInFolder,
    findEntityByPath,
  ])
}
