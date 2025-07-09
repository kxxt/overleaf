import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectSettingsContext } from '@/features/editor-left-menu/context/project-settings-context'
import { useSetCompilationSettingWithEvent } from '@/features/editor-left-menu/hooks/use-set-compilation-setting'
import { usePermissionsContext } from '@/features/ide-react/context/permissions-context'
import { useProjectContext } from '@/shared/context/project-context'
import { getJSON } from '@/infrastructure/fetch-json'
import { debugConsole } from '@/utils/debugging'
import DropdownSetting, { Option } from '../dropdown-setting'

type TypstVersionsResponse = {
  versions: Array<Option<string>>
}

const defaultOptions: Array<Option<string>> = [
  { label: 'Default', value: 'default' },
]

export default function TypstVersionSetting() {
  const { t } = useTranslation()
  const { write } = usePermissionsContext()
  const { projectId } = useProjectContext()
  const { compiler, typstVersion, setTypstVersion } =
    useProjectSettingsContext()
  const [options, setOptions] = useState(defaultOptions)
  const [loading, setLoading] = useState(false)
  const changeTypstVersion = useSetCompilationSettingWithEvent(
    'typst-version',
    setTypstVersion
  )

  useEffect(() => {
    if (compiler !== 'typst') return

    const controller = new AbortController()
    setLoading(true)
    getJSON<TypstVersionsResponse>(`/project/${projectId}/typst-versions`, {
      signal: controller.signal,
    })
      .then(data => setOptions(data.versions))
      .catch(debugConsole.error)
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [compiler, projectId])

  if (compiler !== 'typst') return null

  return (
    <DropdownSetting
      id="typstVersion"
      label={t('typstVersion')}
      disabled={!write}
      loading={loading}
      options={options}
      onChange={changeTypstVersion}
      value={typstVersion || 'default'}
      translateOptions="no"
    />
  )
}
