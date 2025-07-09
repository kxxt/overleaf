import {
  CompletionContext,
  CompletionSource,
} from '@codemirror/autocomplete'
import { syntaxTree } from '@codemirror/language'
import { SyntaxNode } from '@lezer/common'
import { referenceCompletions } from '../latex/completions/references'

const referenceBeforeCursor = /@[\p{ID_Continue}_\-:.]*$/u
const validReferencePrefix = /^[\p{ID_Continue}_\-:.]*$/u

const blockedReferenceContexts = new Set([
  'BlockComment',
  'Equation',
  'LineComment',
  'Math',
  'Raw',
  'Str',
])

const isReferenceContext = (context: CompletionContext) => {
  const node = syntaxTree(context.state).resolveInner(context.pos, -1)

  for (
    let current: SyntaxNode | null = node;
    current;
    current = current.parent
  ) {
    if (current.type.is('Ref')) {
      return true
    }

    if (blockedReferenceContexts.has(current.name)) {
      return false
    }
  }

  // A bare `@` is parsed as text until the first key character is typed.
  return node.type.is('Text')
}

export const typstCitationCompletionSource: CompletionSource = context => {
  const match = context.matchBefore(referenceBeforeCursor)
  if (!match || !isReferenceContext(context)) {
    return null
  }

  const options = referenceCompletions(context)
  if (options.length === 0) {
    return null
  }

  return {
    from: match.from + 1,
    validFor: validReferencePrefix,
    options,
  }
}
