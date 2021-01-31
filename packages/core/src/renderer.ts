/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Texture } from '@pixi/core'
import { Container, DisplayObject } from '@pixi/display'
import { Sprite } from '@pixi/sprite'
import { Text } from '@pixi/text'
import type { Key, ReactNode } from 'react'
import type { FiberRoot } from 'react-reconciler'
import { unstable_now as now } from 'scheduler'
import { createElement } from './elements'
import { Reconciler } from './reconciler'

const roots = new Map<Container, FiberRoot>()

export enum ReactRootTags {
  LegacyRoot = 0,
  BlockingRoot = 1,
  ConcurrentRoot = 2,
}

export const Renderer = Reconciler<
  string, // todo replace ElementType
  Record<string, any>,
  Container,
  Container,
  Text,
  Container,
  unknown,
  Container,
  null, // HostContext
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
      return createElement(type, props as any) // todo
    }
    throw new Error(`Unsupported type: ${type}`)
  },
  removeChild: (parentInstance, child) => {
    parentInstance.removeChild(child)
    child.destroy(true)
  },
  appendChild: (parentInstance, child) => {
    parentInstance.addChild(child)
  },
  insertBefore: (parentInstance, child, beforeChild) => {
    const index = parentInstance.getChildIndex(beforeChild)
    parentInstance.addChildAt(child, index)
  },
  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,
  isPrimaryRenderer: false,
  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,
  queueMicrotask: typeof window.queueMicrotask === 'function'
    ? globalThis.queueMicrotask
      : typeof Promise !== 'undefined'
      ? (callback: (...args: any[]) => any) => Promise.resolve(null).then(callback).catch(handleErrorInNextTick)
    : setTimeout, // TODO: Determine the best fallback here.
  noTimeout: -1,
  appendInitialChild: (parentInstance, child) => {
    parentInstance.addChild(child)
  },
  appendChildToContainer: (container, child) => {
    container.addChild(child)
  },
  removeChildFromContainer: (container, child) => {
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
  getRootHostContext(rootContainer) {
    return null
  },
  getChildHostContext(parentHostContext, type, rootContainer) {
    return parentHostContext
  },
  createTextInstance() {
    throw new Error('要渲染文本，请使用 <Text content="">')
  },
  finalizeInitialChildren(
    instance,
    type,
    props,
    rootContainer,
    hostContext,
  ) {
    return false
  },
  commitMount(instance, type, newProps, internalHandle) {
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
  prepareForCommit() {
    return null
  },
  preparePortalMount() {
    return null
  },
  resetAfterCommit(containerInfo) { },
  shouldSetTextContent() {
    return false
  },
  clearContainer(container) {
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
  tag = ReactRootTags.ConcurrentRoot,
) {
  console.group('render', { element, container })
  let root = roots.get(container)
  console.info({ root })
  if (!root) {
    const newRoot = (root = Renderer.createContainer(
      container,
      tag,
      false,
      null,
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

function handleErrorInNextTick(error: unknown) {
  setTimeout(() => {
    throw error;
  });
}