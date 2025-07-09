import ModalContentNewProjectForm from './modal-content-new-project-form'
import { OLModal } from '@/shared/components/ol/ol-modal'
import { Tag } from '../../../../../../app/src/Features/Tags/types'

type BlankProjectModalProps = {
  onHide: () => void
  initialTags?: Tag[]
  language?: 'latex' | 'typst'
}

function BlankProjectModal({
  onHide,
  initialTags,
  language = 'latex',
}: BlankProjectModalProps) {
  const template = language === 'typst' ? 'typst-none' : 'none'
  return (
    <OLModal
      show
      animation
      onHide={onHide}
      id="blank-project-modal"
      backdrop="static"
    >
      <ModalContentNewProjectForm
        onCancel={onHide}
        initialTags={initialTags}
        template={template}
      />
    </OLModal>
  )
}

export default BlankProjectModal
