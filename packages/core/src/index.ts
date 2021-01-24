import { Container as ContainerElement } from '@pixi/display'
import { Sprite as SpriteElement } from '@pixi/sprite'
import { Text as TextElement } from '@pixi/text'

import type { Key, ReactElement, ReactNode, Ref } from 'react'

export * from './hooks'
export * from './renderer'
export * from './targets/web'
export { useCanvasState, CanvasState } from './canvas'

export type ContainerProps = {
  x?: number
  y?: number
  children?: ReactNode
  key?: Key
  ref?: Ref<ContainerElement>
}

export const Container: (props: ContainerProps) => ReactElement<ContainerProps, 'Container'> = 'Container' as any
export type Container = ContainerElement

export type SpriteProps = {
  x: number
  y: number
  key?: Key
  ref?: Ref<SpriteElement>
  href: string
}

export const Sprite: (props: SpriteProps) => ReactElement<SpriteProps, 'Sprite'> = 'Sprite' as any

export type TextProps = {
  x?: number
  y?: number
  key?: Key
  ref?: Ref<TextElement>
  content?: string
}

export const Text: (props: TextProps) => ReactElement<TextProps, 'Text'> = 'Text' as any

export function createElement (type: 'Container') {
  if (type === 'Container') {
    return new ContainerElement()
  }
  throw new Error('error')
}
