import { ensureSyntaxTree } from '@codemirror/language'
import { EditorState, Transaction } from '@codemirror/state'
import { IterMode, SyntaxNodeRef } from '@lezer/common'

const TWENTY_MS = 20
const FIVE_HUNDRED_MS = 500

/**
 * A single item in the projection
 */
export abstract class ProjectionItem {
  readonly from: number = 0
  readonly to: number = 0
  readonly line: number = 0
  readonly toLine: number = 0
}

/* eslint-disable no-unused-vars */
export enum ProjectionStatus {
  Pending,
  Partial,
  Complete,
}
/* eslint-enable no-unused-vars */

/*
 * Result of extracting a projection from the document.
 * Holds the list of ProjectionItems and the status of
 * the projection
 */
export interface ProjectionResult<T extends ProjectionItem> {
  items: T[]
  status: ProjectionStatus
}

const intersects = (fromA: number, toA: number, fromB: number, toB: number) => {
  return !(toA < fromB || fromA > toB)
}

export type NodeIntersectsChangeFn = (node: SyntaxNodeRef) => boolean

export function updatePosition<T extends ProjectionItem>(
  item: T,
  transaction?: Transaction
): T {
  if (!transaction) {
    return item
  }
  const { from, to } = item
  const newFrom = transaction.changes.mapPos(from)
  const newTo = transaction.changes.mapPos(to)
  const newLine = transaction.state.doc.lineAt(newFrom).number
  const newToLine = transaction.state.doc.lineAt(newTo).number

  if (
    newFrom === from &&
    newTo === to &&
    newLine === item.line &&
    newToLine === item.toLine
  ) {
    // Optimisation - if the item hasn't moved, don't create a new object
    // If items are not immutable this can introduce problems
    return item
  }

  return {
    ...item,
    from: newFrom,
    to: newTo,
    line: newLine,
    toLine: newToLine,
  }
}

export type EnterNodeFn<T> = (
  state: EditorState,
  node: SyntaxNodeRef,
  items: T[],
  nodeIntersectsChange: NodeIntersectsChangeFn
) => any

/**
 * Calculates an updated projection of an editor state. Passing a previous ProjectionResult
 * will reuse the existing projection elements (though updating their position to
 * point correctly into the latest EditorState), outside of the changed range.
 *
 * @param state The current editor state
 * @param fromA The start of the modified range in the previous state.
 *              Ignored if `previousResult` is not provided
 * @param toA The end of the modified range in the previous state.
 *            Ignored if `previousResult` is not provided
 * @param fromB The start of the modified range in the `state`
 * @param toB The end of the modified range in the `state`
 * @param initialParse If this is the intial parse of the document. If that's
 *                     the case, we allow 500ms parse time instead of 20ms
 * @param enterNode A function to call when 'enter'ing a node while traversing the syntax tree,
 *                  used to identify nodes we are interested in.
 * @param transaction Optional, used to update item positions in `previousResult`
 * @param previousResult A previous ProjectionResult that will be reused for
 *                        projection elements outside of the range of [fromA; toA]
 * @returns A ProjectionResult<T> pointing to locations in `state`
 */
export function getUpdatedProjection<T extends ProjectionItem>(
  state: EditorState,
  fromA: number,
  toA: number,
  fromB: number,
  toB: number,
  initialParse = false,
  enterNode: EnterNodeFn<T>,
  transaction?: Transaction,
  previousResult: ProjectionResult<T> = {
    items: [],
    status: ProjectionStatus.Pending,
  }
): ProjectionResult<T> {
  // Only reuse results from a Complete parse, otherwise we may drop entries.
  // We keep items that lie outside the range that will be reparsed, and update
  // their positions. Expand the new change range to include the current lines
  // occupied by invalidated items. This matters when an edit shrinks a syntax
  // node so that its new range no longer intersects [fromB; toB].
  let reparseFrom = fromB
  let reparseTo = toB
  const reusableItems: T[] = []

  if (previousResult.status === ProjectionStatus.Complete) {
    for (const item of previousResult.items) {
      const updatedItem = updatePosition(item, transaction)
      if (intersects(item.from, item.to, fromA, toA)) {
        const updatedFrom = Math.max(
          0,
          Math.min(updatedItem.from, state.doc.length)
        )
        const updatedTo = Math.max(
          0,
          Math.min(updatedItem.to, state.doc.length)
        )
        reparseFrom = Math.min(
          reparseFrom,
          state.doc.lineAt(updatedFrom).from
        )
        reparseTo = Math.max(reparseTo, state.doc.lineAt(updatedTo).to)
      } else {
        reusableItems.push(updatedItem)
      }
    }
  }

  if (previousResult.status !== ProjectionStatus.Complete) {
    // We have previously tried to compute the projection, but unsuccessfully,
    // so we should try to parse the whole file again.
    reparseTo = state.doc.length
    reparseFrom = 0
  }

  // Expanding to full lines may include other cached items. Recreate those
  // from the syntax tree as well so the result does not contain stale or
  // duplicate entries.
  const items = reusableItems.filter(
    item => !intersects(item.from, item.to, reparseFrom, reparseTo)
  )

  const tree = ensureSyntaxTree(
    state,
    reparseTo,
    initialParse ? FIVE_HUNDRED_MS : TWENTY_MS
  )
  if (tree) {
    tree.iterate({
      from: reparseFrom,
      to: reparseTo,
      enter(node) {
        const nodeIntersectsChange = (n: SyntaxNodeRef) => {
          return intersects(n.from, n.to, reparseFrom, reparseTo)
        }
        return enterNode(state, node, items, nodeIntersectsChange)
      },
      mode: IterMode.IgnoreMounts | IterMode.IgnoreOverlays,
    })
    // We know the exact projection. Return it.
    return {
      status: ProjectionStatus.Complete,
      items: items.sort((a, b) => a.from - b.from),
    }
  } else if (previousResult.status !== ProjectionStatus.Pending) {
    // We don't know the latest projection, but we have an idea of a previous
    // projection.
    return {
      status: ProjectionStatus.Partial,
      items: previousResult.items,
    }
  } else {
    // We have no previous projection, and no idea of the current projection.
    // Return pending.
    return {
      items: [],
      status: ProjectionStatus.Pending,
    }
  }
}
