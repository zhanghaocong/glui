import { Container, DisplayObject } from '@pixi/display'
import { ContainerProps, createContainer } from './container'
import { mixinEventHandlerAccessors } from './event-target'
import { createText, TextProps } from './text'
import type { ElementType } from './types'

let configureElements = () => {
  mixinEventHandlerAccessors()
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  configureElements = () => {}
}
configureElements()

export function createElement (type: 'Container', props?: ContainerProps): Container

export function createElement (type: 'Text', props?: TextProps): Container

export function createElement <
  T extends ElementType,
  P extends ContainerProps | TextProps>(type: T, props?: P): DisplayObject {
  if (type === 'Container') {
    return createContainer(props as ContainerProps)
  } else if (type === 'Text') {
    return createText(props as TextProps)
  }

  throw new Error(`createElement error: invalid type: ${type}`)
}
