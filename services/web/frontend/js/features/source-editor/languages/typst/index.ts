import { LanguageSupport } from '@codemirror/language'
import { languages as codeLanguages } from '@codemirror/language-data'
import { typst_lezer } from 'codemirror-lang-typst/lezer'

import { shortcuts } from './shortcuts'
import { documentOutline } from '../latex/document-outline'
import { typstCitationCompletionSource } from './complete'

export function typst(): LanguageSupport {
  const support = typst_lezer({ codeLanguages })
  return new LanguageSupport(support.language, [
    support.support,
    shortcuts(),
    documentOutline,
    support.language.data.of({
      autocomplete: typstCitationCompletionSource,
    }),
  ])
}
