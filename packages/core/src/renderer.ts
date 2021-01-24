/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Texture } from '@pixi/core'
import { Container, DisplayObject } from '@pixi/display'
import { Sprite } from '@pixi/sprite'
import { Text } from '@pixi/text'
import type { Key, ReactNode } from 'react'
import { FiberRoot, OpaqueHandle } from 'react-reconciler'
import {
  unstable_IdlePriority as idlePriority,
  unstable_now as now,
  unstable_runWithPriority as run
} from 'scheduler'
import type { CanvasState } from './canvas'
import { Reconciler } from './reconciler'

const emptyObject = {}

const roots = new Map<Container, FiberRoot>()

run(idlePriority, () => {
  return
})

type StateContainer = Container & { __state?: CanvasState }

export const Renderer = Reconciler({
  now,
  createInstance: (
    type: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props: Record<string, any>,
    rootContainerInstance: StateContainer,
    hostContext: unknown,
    internalInstanceHandle: OpaqueHandle,
  ): DisplayObject => {
    if (type === 'Sprite') {
      const instance = new Sprite(Texture.from(props.href))
      instance.position.set(props.x, props.y)
      instance.interactive = true
      instance.buttonMode = true
      instance.anchor.set(0.5)
      instance.on('pointerdown', function (this: DisplayObject) {
        this.scale.x *= 1.25
        this.scale.y *= 1.25
      })
      return instance
    } else if (type === 'Container') {
      const instance = new Container()
      instance.position.set(props.x, props.y)
      return instance
    } else if (type === 'Text') {
      const instance = new Text(props.content)
      instance.position.set(props.x ?? 0, props.y ?? 0)
      return instance
    }
    throw new Error(`无效的 type ${type}`)
  },
  removeChild: (parentInstance: Container, child: DisplayObject) => {
    parentInstance.removeChild(child)
  },
  appendChild: (parentInstance: Container, child: DisplayObject) => {
    parentInstance.addChild(child)
  },
  insertBefore: (parentInstance: Container, child: DisplayObject, beforeChild: DisplayObject) => {
    const index = parentInstance.getChildIndex(beforeChild)
    parentInstance.addChildAt(child, index)
  },
  supportsMutation: true,
  isPrimaryRenderer: false,
  setTimeout: window.setTimeout,
  clearTimeout: window.clearTimeout,
  noTimeout: -1,
  appendInitialChild: (parentInstance: Container, child: DisplayObject) => {
    parentInstance.addChild(child)
  },
  appendChildToContainer: (container: StateContainer, child: DisplayObject) => {
    container.addChild(child)
  },
  removeChildFromContainer: (container: StateContainer, child: DisplayObject) => {
    container.removeChild(child)
  },
  insertInContainerBefore: () => {},
  commitUpdate(instance: any, updatePayload: any, type: string, oldProps: any, newProps: any, fiber: OpaqueHandle) {
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
  getRootHostContext(rootContainerInstance: StateContainer) {
    return rootContainerInstance.__state
  },
  getChildHostContext(parentHostContext: unknown, type: string, rootContainerInstance: StateContainer) {
    return parentHostContext
  },
  createTextInstance() {
    throw new Error('不支持文本节点，请使用 <Text> 渲染文本')
  },
  finalizeInitialChildren(
    parentInstance: Container,
    type: string,
    props: Record<string, any>,
    rootContainerInstance: Container,
    hostContext: unknown,
  ) {
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
  resetAfterCommit(containerInfo: Container) {
    
  },
  shouldSetTextContent() {
    return false
  },
  clearContainer(container: Container) {
    container.removeChildren()
  },
})

Renderer.injectIntoDevTools({
  bundleType: process.env.NODE_ENV === 'production' ? 0 : 1,
  version: process.env.PKG_VERSION ?? '0.0.0',
  rendererPackageName: '@react-canvas-ui/core',
})

export function render(
  element: ReactNode,
  container: Container,
  state: CanvasState,
) {
  console.group('render', { element, container, state })
  let root = roots.get(container)
  console.info({ root })
  if (!root) {
    (container as StateContainer).__state = state
    const newRoot = (root = Renderer.createContainer(
      container,
      false,
      false,
    ))
    roots.set(container, newRoot)
  }
  Renderer.updateContainer(element, root, null, () => undefined)
  console.groupEnd()
  return Renderer.getPublicRootInstance(root)
}

export function unmountComponentAtNode(container: Container, callback?: (c: Container) => void) {
  const root = roots.get(container)
  if (root) {
    Renderer.updateContainer(null, root, null, () => {

      // 移除 container，此时 container.parent 一定是 stage
      container.parent?.removeChild(container)

      delete (container as StateContainer).__state
      roots.delete(container)
      callback?.(container)
    })
    return true
  }
  return false
}

const hasSymbol = typeof Symbol === 'function' && Symbol.for
const REACT_PORTAL_TYPE = hasSymbol ? Symbol.for('react.portal') : 0xeaca

export function createPortal(
  children: ReactNode,
  containerInfo?: Container, 
  implementation?: any, 
  key: Key = ''
) {
  return {
    $$typeof: REACT_PORTAL_TYPE,
    key,
    children,
    containerInfo,
    implementation,
  }
}
