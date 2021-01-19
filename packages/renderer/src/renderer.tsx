import ReactReconciler from 'react-reconciler'
import {
  unstable_now as now,
  unstable_IdlePriority as idlePriority,
  unstable_runWithPriority as run
} from 'scheduler'

const emptyObject = {}

run(idlePriority, () => {
  console.info('run(idlePriority)')
})

export const Renderer = ReactReconciler({
  now,
  createInstance: () => {},
  removeChild: () => {},
  appendChild: () => {},
  insertBefore: () => {},
  supportsMutation: true,
  isPrimaryRenderer: false,
  setTimeout: window.setTimeout,
  clearTimeout: window.clearTimeout,
  noTimeout: -1,
  appendInitialChild: () => {},
  appendChildToContainer: () => {},
  removeChildFromContainer: () => {},
  insertInContainerBefore: () => {},
  commitUpdate(instance: any, updatePayload: any, type: string, oldProps: any, newProps: any, fiber: Reconciler.Fiber) {
    
  },
  hideInstance(instance: any) {
    
  },
  unhideInstance(instance: any, props: any) {
    
  },
  hideTextInstance() {
    throw new Error(
      'Text is not allowed in the react-three-fibre tree. You may have extraneous whitespace between components.'
    )
  },
  getPublicInstance(instance: any) {
    return instance
  },
  getRootHostContext() {
    return emptyObject
  },
  getChildHostContext() {
    return emptyObject
  },
  createTextInstance() {},
  finalizeInitialChildren(instance: any) {
    // https://github.com/facebook/react/issues/20271
    // Returning true will trigger commitMount
    return instance.__handlers
  },
  commitMount(instance: any /*, type, props*/) {
    // https://github.com/facebook/react/issues/20271
    // This will make sure events are only added once to the central container
  },
  prepareUpdate() {
    return emptyObject
  },
  shouldDeprioritizeSubtree() {
    return false
  },
  prepareForCommit() {
    return null
  },
  preparePortalMount() {
    return null
  },
  resetAfterCommit() {},
  shouldSetTextContent() {
    return false
  },
  clearContainer() {
    return false
  },
})
