/**
 * `cite` completions based on reference keys in the project
 */
import { Completion, CompletionContext } from '@codemirror/autocomplete'
import { Completions } from './types'
import { metadataState } from '../../../extensions/language'
import { extendRequiredParameter } from './apply'
import { maybeGetSectionForOption } from './sections'

export function buildReferenceCompletions(
  completions: Completions,
  context: CompletionContext
) {
  completions.references.push(
    ...referenceCompletions(context, extendRequiredParameter)
  )
}

export function referenceCompletions(
  context: CompletionContext,
  extend?: Completion['extend']
): Completion[] {
  const metadata = context.state.field(metadataState, false)

  if (!metadata) {
    return []
  }

  return Array.from(metadata.referenceKeys, referenceKey => {
    const completion: Completion = {
      type: 'reference',
      label: referenceKey,
      section: maybeGetSectionForOption(context, 'references'),
      deduplicate: {
        key: referenceKey,
        priority: 1,
      },
    }

    if (extend) {
      completion.extend = extend
    }

    return completion
  })
}
