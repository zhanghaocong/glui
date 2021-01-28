import { Graphics as PixiGraphcis } from '@pixi/graphics'
import { ContainerProps } from './container'
import { defaultApplyProps } from './utils'

type Draw = (g: Graphics) => void

class Graphics extends PixiGraphcis {

  /**
   * 通过 props 设置 `draw` 时，立即调用他以便重绘
   */
  set draw (value: Draw | null) {
    value?.(this)
  }
}

export type GraphicsProps = {
  draw?: Draw
} & ContainerProps

export function createGraphics (props: GraphicsProps) {
  const el = new Graphics()
  defaultApplyProps(el, props)
  return el
}
