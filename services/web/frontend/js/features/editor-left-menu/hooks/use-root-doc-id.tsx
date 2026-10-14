import { useCallback } from 'react'
import { useIdeReactContext } from '@/features/ide-react/context/ide-react-context'
import { useProjectContext } from '@/shared/context/project-context'
import type { ProjectSettings } from '../utils/api'
import useSaveProjectSettings from './use-save-project-settings'
import { useTypstRootDoc } from '@/shared/hooks/use-root-doc'

export default function useRootDocId() {
  const { project } = useProjectContext()
  const typstRootDoc = useTypstRootDoc()
  const rootDocId =
    project?.compiler === 'typst' ? typstRootDoc?.doc.id : project?.rootDocId
  const { permissionsLevel } = useIdeReactContext()
  const saveProjectSettings = useSaveProjectSettings()

  const setRootDocIdFunc = useCallback(
    async (newRootDocId: ProjectSettings['rootDocId']) => {
      const allowUpdate = permissionsLevel !== 'readOnly'

      if (allowUpdate) {
        try {
          await saveProjectSettings('rootDocId', newRootDocId)
        } catch (err) {
          // TODO: retry mechanism (max 10x before failed completely and rollback the old value)
        }
      }
    },
    [permissionsLevel, saveProjectSettings]
  )

  return {
    rootDocId,
    setRootDocId: setRootDocIdFunc,
  }
}
