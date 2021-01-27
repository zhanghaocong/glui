/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Container } from '@pixi/display'

export type ElementType = 'Container' | 'Image' | 'Text' | 'Graphics' | 'ScrollView'

export type UpdatePayload = any[]

export type ElementProps = Record<string, any>

export type ElementDescriptor<T extends Container, P extends ElementProps> = {
  create: (props?: P) => T
  diffProps: (prevProps: P, nextProps: P) => UpdatePayload | null
  applyUpdate: (el: T, payload: UpdatePayload) => void
}

