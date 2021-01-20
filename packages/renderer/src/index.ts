import type { ReactElement, ReactNode } from 'react'

export * from './hooks'
export * from './renderer'
export * from './targets/web'

export type ContainerProps = {
  x: number
  y: number
  children: ReactNode
}
export declare const Container: (props: ContainerProps) => ReactElement<ContainerProps>
