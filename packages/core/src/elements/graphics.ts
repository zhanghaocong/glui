import { Graphics as PixiGraphcis } from '@pixi/graphics'
import { ContainerProps } from './container'
import { defaultApplyProps } from './utils'

/**
 * 描述一个绘图方法，他接受一个参数 `g`，通过他你可以进行任意绘图操作
 * 
 * ```ts
 * const drawRect = (g: Graphics) => {
 *  g.beginFill(0xff0000)
 *  g.drawRect(0, 0, 100, 100)
 *  g.endFill()
 * }
 * <Grahpics draw={ drawRect } />
 * ```
 */
type Draw = (g: Graphics) => void

class Graphics extends PixiGraphcis {

  /**
   * 通过 props 设置 `draw` 时，立即调用他以便重绘
   */
  set draw (value: Draw | null) {
    if (value) {
      value(this)
    } else {
      // 当设置为 `null` 时，简单清除画布即可
      this.clear()
    }
  }
}

export type GraphicsProps = {
  draw?: Draw
} & ContainerProps

export function createGraphics (props?: GraphicsProps) {
  const el = new Graphics()
  if (props) {
    defaultApplyProps(el, props)
  }
  return el
}
