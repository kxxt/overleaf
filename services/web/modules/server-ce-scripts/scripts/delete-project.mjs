import minimist from 'minimist'
import ProjectDeleter from '../../../app/src/Features/Project/ProjectDeleter.mjs'
import { DeletedProjectReasons } from '../../../app/src/Features/Project/DeletedProjectReasons.mjs'
import {
  ObjectId,
  waitForDb,
} from '../../../app/src/infrastructure/mongodb.mjs'

export default async function deleteProject() {
  const { id: projectId } = minimist(process.argv.slice(2), {
    string: ['id'],
  })
  if (!projectId || !ObjectId.isValid(projectId)) {
    throw new Error(
      `Usage: node ${import.meta.filename} --id=5a9414f259776c7900b300e6`
    )
  }

  await waitForDb()
  console.log('deleting project:', projectId)
  await ProjectDeleter.promises.deleteProject(projectId, {
    deletedReason: DeletedProjectReasons.SCRIPT,
  })
}

if (import.meta.filename === process.argv[1]) {
  deleteProject()
    .then(() => {
      console.error('Done.')
      process.exit(0)
    })
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}
