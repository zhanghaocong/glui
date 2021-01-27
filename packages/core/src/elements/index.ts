import { Container, DisplayObject } from '@pixi/display'
import { ContainerDescriptor, ContainerProps } from './container'
import { mixinEventHandlerAccessors } from './event-target'
import type { ElementProps, ElementType } from './types'
export type { ElementProps } from './types'

let configureElements = () => {
  mixinEventHandlerAccessors()
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  configureElements = () => {}
}
configureElements()

export function createElement (type: 'Container', props?: ContainerProps): Container

export function createElement <T extends ElementType, P extends ElementProps>(type: T, props?: P): DisplayObject {
  if (type === 'Container') {
    return ContainerDescriptor.create(props)
  }

  throw new Error(`createElement error: invalid type: ${type}`)
}

