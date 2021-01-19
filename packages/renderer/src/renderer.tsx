import ReactReconciler from 'react-reconciler'
import {
  unstable_now as now,
  unstable_IdlePriority as idlePriority,
  unstable_runWithPriority as run
} from 'scheduler'

const emptyObject = {}

run(idlePriority, () => {
  return
})

export const Reconciler = ReactReconciler({
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
    throw new Error('不支持文本节点，请使用 <Text> 渲染文本')
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
  createTextInstance() {
    throw new Error('不支持文本节点，请使用 <Text> 渲染文本')
  },
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
