import type { DisplayObject } from '@pixi/display'
import { ContainerProps, createContainer } from './container'
import { createText, TextProps } from './text'
import type { ElementType } from './types'
import './event-target'

export function createElement (type: 'Container', props?: ContainerProps): ReturnType<typeof createContainer>

export function createElement (type: 'Text', props?: TextProps): ReturnType<typeof createText>

export function createElement<
  T extends ElementType,
  P extends ContainerProps | TextProps>(type: T, props?: P): DisplayObject {
  if (type === 'Container') {
    return createContainer(props as ContainerProps)
  } else if (type === 'Text') {
    return createText(props as TextProps)
  }

  throw new Error(`createElement error: invalid type: ${type}`)
}
