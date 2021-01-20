import { Texture } from '@pixi/core'
import { Container, DisplayObject } from '@pixi/display'
import { Sprite } from '@pixi/sprite'
import type { ReactNode } from 'react'
import ReactReconciler, { FiberRoot, OpaqueHandle } from 'react-reconciler'
import {
  unstable_IdlePriority as idlePriority,
  unstable_now as now,
  unstable_runWithPriority as run
} from 'scheduler'
import type { CanvasState } from './canvas'

const emptyObject = {}

const roots = new Map<Container, FiberRoot>()

run(idlePriority, () => {
  return
})

type StateContainer = Container & { __state: CanvasState }

export const Reconciler = ReactReconciler({
  now,
  createInstance: (
    type: string,
    props: Record<string, any>,
    rootContainerInstance: StateContainer,
    hostContext: unknown,
    internalInstanceHandle: OpaqueHandle,
  ): DisplayObject => {
    console.group('createInstance')
    console.info({
      type,
      props,
      rootContainerInstance,
      hostContext,
      internalInstanceHandle,
    })
    console.groupEnd()
    if (type === 'Image') {
      const instance = new Sprite(Texture.from(props.href))
      instance.position.set(props.x, props.y)
      instance.interactive = true
      instance.buttonMode = true
      instance.pivot.set(0.5)
      instance.on('pointerdown', function (this: DisplayObject) {
        this.scale.x *= 1.25
        this.scale.y *= 1.25
      })
      return instance
    } else if (type === 'Container') {
      const instance = new Container()
      instance.position.set(props.x, props.y)
      return instance
    }
    throw new Error(`无效的 type ${type}`)
  },
  removeChild: () => {

  },
  appendChild: (parentInstance: Container, child: DisplayObject) => {
    console.group('appendChild')
    parentInstance.addChild(child)
    console.groupEnd()
  },
  insertBefore: (parentInstance: Container, child: DisplayObject, beforeChild: DisplayObject) => {
    console.group('insertBefore')
    const index = parentInstance.getChildIndex(beforeChild)
    parentInstance.addChildAt(child, index)
    console.groupEnd()
  },
  supportsMutation: true,
  isPrimaryRenderer: false,
  setTimeout: window.setTimeout,
  clearTimeout: window.clearTimeout,
  noTimeout: -1,
  appendInitialChild: (parentInstance: Container, child: DisplayObject) => {
    console.group('appendInitialChild')
    console.info(parentInstance, child)
    parentInstance.addChild(child)
    console.groupEnd()
  },
  appendChildToContainer: (container: StateContainer, child: DisplayObject) => {
    console.group('appendChildToContainer')
    console.info(container, child)

    if (!container.parent) {
      container.__state.stage.addChild(container)
    }
    container.addChild(child)
    console.groupEnd()
  },
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
    return false
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

export function render(
  element: ReactNode,
  container: Container,
  state: CanvasState,
) {
  console.group('render')
  let root = roots.get(container)
  console.info({ element, container, state }, { root })
  if (!root) {
    (container as StateContainer).__state = state
    const newRoot = (root = Reconciler.createContainer(
      container,
      false,
      false,
    ))
    roots.set(container, newRoot)
  }
  Reconciler.updateContainer(element, root, null, () => undefined)
  console.groupEnd()
  return Reconciler.getPublicRootInstance(root)
}

const Debug = <T>(hostConfig: T) => {
  return hostConfig
}