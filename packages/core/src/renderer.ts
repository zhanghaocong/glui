/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Texture } from '@pixi/core'
import { Container, DisplayObject } from '@pixi/display'
import { Sprite } from '@pixi/sprite'
import { Text } from '@pixi/text'
import type { Key, ReactNode } from 'react'
import type { FiberRoot, OpaqueHandle } from 'react-reconciler'
import { unstable_now as now } from 'scheduler'
import { createElement } from '.'
import type { ElementProps } from './elements'
import { Reconciler } from './reconciler'

const emptyObject = {}

const roots = new Map<Container, FiberRoot>()

export const Renderer = Reconciler<
  string, // Type
  ElementProps,
  Container,
  DisplayObject,
  Text,
  unknown,
  DisplayObject,
  unknown, // 
  any[], // UpdatePayload
  unknown, // ChildSet 暂时没有用到
  number, // setTimeout 的返回值
  -1
  >({
  now,
  createInstance: (type, props, rootContainerInstance, hostContext, internalInstanceHandle) => {
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
      return createElement(type, props as any) // todo
    } else if (type === 'Text') {
      const instance = new Text(props.content, {
        fontSize: 20
      })
      instance.position.set(props.x ?? 0, props.y ?? 0)
      return instance
    }
    throw new Error(`Unsupported type: ${type}`)
  },
  removeChild: (parentInstance: Container, child: DisplayObject) => {
    parentInstance.removeChild(child)
    child.destroy(true)
  },
  appendChild: (parentInstance: Container, child: DisplayObject) => {
    parentInstance.addChild(child)
  },
  insertBefore: (parentInstance: Container, child: DisplayObject, beforeChild: DisplayObject) => {
    const index = parentInstance.getChildIndex(beforeChild)
    parentInstance.addChildAt(child, index)
  },
  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,
  isPrimaryRenderer: false,
  scheduleTimeout: window.setTimeout,
  cancelTimeout: window.clearTimeout,
  noTimeout: -1,
  appendInitialChild: (parentInstance: Container, child: DisplayObject) => {
    parentInstance.addChild(child)
  },
  appendChildToContainer: (container: Container, child: DisplayObject) => {
    container.addChild(child)
  },
  removeChildFromContainer: (container: Container, child: DisplayObject) => {
    container.removeChild(child)
    child.destroy(true)
  },
  insertInContainerBefore: () => {},
  commitUpdate(instance, updatePayload, type, prevProps, nextProps, internalHandle) {
  },
  hideInstance(instance) {
    instance.visible = false
  },
  unhideInstance(instance) {
    instance.visible = true
  },
  hideTextInstance() {
    throw new Error('要渲染文本，请使用 <Text content="">')
  },
  getPublicInstance(instance) {
    return instance
  },
  getRootHostContext(rootContainerInstance: Container) {
    return emptyObject
  },
  getChildHostContext(parentHostContext: unknown, type: string, rootContainerInstance: Container) {
    return parentHostContext
  },
  createTextInstance() {
    throw new Error('要渲染文本，请使用 <Text content="">')
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
  commitMount(instance: DisplayObject,
    type: string,
    newProps: Record<string, any>,
    internalInstanceHandle: OpaqueHandle
  ) {
  },
  prepareUpdate(
    instance,
    type,
    oldProps,
    newProps,
    rootContainerInstance,
    hostContext
  ) {
    return null
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
  resetAfterCommit(containerInfo: Container) { },
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
) {
  console.group('render', { element, container })
  let root = roots.get(container)
  console.info({ root })
  if (!root) {
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
