import { getCurrentScope, onScopeDispose, watch } from 'vue'
import { MaybeRefOrGetter } from '@/types/maybe'
import { toValue } from '@/utilities/vue'

export type UseEventListener = {
  add: () => void,
  remove: () => void,
}

export type UseEventListenerOptions = AddEventListenerOptions & {
  immediate?: boolean,
}

const defaultOptions: UseEventListenerOptions = {
  immediate: true,
}

export function useEventListener<K extends keyof DocumentEventMap>(target: MaybeRefOrGetter<Document | undefined | null>, key: K, callback: (this: Document, event: DocumentEventMap[K]) => unknown, options?: UseEventListenerOptions): UseEventListener
export function useEventListener<K extends keyof HTMLElementEventMap>(target: MaybeRefOrGetter<HTMLElement | undefined | null>, key: K, callback: (this: HTMLElement, event: HTMLElementEventMap[K]) => unknown, options?: UseEventListenerOptions): UseEventListener
// eslint-disable-next-line max-params
export function useEventListener<K extends string>(target: MaybeRefOrGetter<Node | undefined | null>, key: K, callback: (this: Node, event: Event) => unknown, options: UseEventListenerOptions = {}): UseEventListener {
  const { immediate, ...listenerOptions } = { ...defaultOptions, ...options }

  function add(): void {
    toValue(target)?.addEventListener(key, callback, listenerOptions)
  }

  function remove(): void {
    toValue(target)?.removeEventListener(key, callback, listenerOptions)
  }

  if (getCurrentScope()) {
    onScopeDispose(() => remove())
  }

  if (immediate) {
    add()
  }

  watch(() => toValue(target), () => {
    remove()
    add()
  })

  return {
    add,
    remove,
  }
}