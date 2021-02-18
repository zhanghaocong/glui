import { canvasUtils } from '@pixi/canvas-renderer'
import { IBatchableElement, Renderer, Texture } from '@pixi/core'
import { IDestroyOptions } from '@pixi/display'
import { FillStyle, Graphics, GraphicsGeometry } from '@pixi/graphics'
import {
  Circle,
  Ellipse,
  Matrix,
  Point,
  Polygon,
  Rectangle,
  RoundedRectangle,
  SHAPES
} from '@pixi/math'
import type { ContainerProps } from '../container'
import { defaultApplyProps } from '../utils'
import { canvasPool } from './canvas-pool'
import type { Draw } from './types'

const DEBUG_GRAPHICS = true

// 1. Props
export type GraphicsProps = {
  draw?: Draw<GraphicsElement> | null
} & ContainerProps

const indices = new Uint16Array([0, 1, 2, 0, 2, 3])
const uvs = new Float32Array(8)

// 2. Element
export class GraphicsElement extends Graphics implements IBatchableElement {

  _texture: Texture

  uvs = uvs

  vertexData = new Float32Array(8)

  indices = indices

  _tintRGB = 0xFFFFFF

  private canvas: HTMLCanvasElement

  private context: CanvasRenderingContext2D

  private _textureID = -1

  private _anchor = new Point()

  private shouldUpdateTexture = true

  private geometryDirty = -1

  private resolution = 1

  constructor(geometry?: GraphicsGeometry) {
    super(geometry)

    const { canvas, context } = canvasPool.take(3, 3)
    this.canvas = canvas
    this.context = context
    this._texture = Texture.from(canvas)
    this._texture.orig = new Rectangle()
    this._texture.trim = new Rectangle()
  }

  _calculateBounds() {
    this.finishPoly()
    const { geometry } = this
    if (!geometry.graphicsData.length) {
      return
    }
    const { minX, minY, maxX, maxY } = geometry.bounds
    console.info(geometry.bounds)
    this._bounds.addFrame(this.transform, minX, minY, maxX, maxY)
  }

  calculateVertices(): void {
    const texture = this._texture

    if (this._transformID === this.transform._worldID && this._textureID === texture._updateID) {
      return
    }

    // update texture UV here, because base texture can be changed without calling `_onTextureUpdate`
    if (this._textureID !== texture._updateID) {
      this.uvs = this._texture._uvs.uvsFloat32
    }

    this._transformID = this.transform._worldID
    this._textureID = texture._updateID

    // set the vertex data
    const wt = this.transform.worldTransform
    const a = wt.a
    const b = wt.b
    const c = wt.c
    const d = wt.d
    const tx = wt.tx
    const ty = wt.ty
    const vertexData = this.vertexData
    const trim = texture.trim
    const orig = texture.orig
    const anchor = this._anchor

    let w0 = 0
    let w1 = 0
    let h0 = 0
    let h1 = 0

    if (trim) {
      // if the sprite is trimmed and is not a tilingsprite then we need to add the extra
      // space before transforming the sprite coords.
      w1 = trim.x - (anchor.x * orig.width)
      w0 = w1 + trim.width

      h1 = trim.y - (anchor.y * orig.height)
      h0 = h1 + trim.height
    }
    else {
      w1 = -anchor.x * orig.width
      w0 = w1 + orig.width

      h1 = -anchor.y * orig.height
      h0 = h1 + orig.height
    }

    // xy
    vertexData[0] = (a * w1) + (c * h1) + tx
    vertexData[1] = (d * h1) + (b * w1) + ty

    // xy
    vertexData[2] = (a * w0) + (c * h1) + tx
    vertexData[3] = (d * h1) + (b * w0) + ty

    // xy
    vertexData[4] = (a * w0) + (c * h0) + tx
    vertexData[5] = (d * h0) + (b * w0) + ty

    // xy
    vertexData[6] = (a * w1) + (c * h0) + tx
    vertexData[7] = (d * h0) + (b * w1) + ty
  }

  private updateTexture(resolution: number) {

    const geometryDirty = (this.geometry as any).dirty // dirty 是 protected
    if (this.geometryDirty !== geometryDirty) {
      this.geometryDirty = geometryDirty
      this.shouldUpdateTexture = true
    }

    if (this.resolution !== resolution) {
      this.resolution = resolution
      this.shouldUpdateTexture = true
    }

    if (!this.shouldUpdateTexture) {
      return
    }

    const localBounds = this.getLocalBounds()
    const {
      canvas,
      context,
      _texture,
      geometry: { graphicsData },
    } = this

    const size = {
      width: localBounds.width,
      height: localBounds.height,
    }

    canvas.width = size.width * resolution
    canvas.height = size.height * resolution

    context.scale(resolution, resolution)
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.translate(-localBounds.x, -localBounds.y)

    let contextFillStyle: string | CanvasPattern = ''
    let contextStrokeStyle: string | CanvasPattern = ''

    const tintR = ((this.tint >> 16) & 0xFF) / 255
    const tintG = ((this.tint >> 8) & 0xFF) / 255
    const tintB = (this.tint & 0xFF) / 255

    for (let i = 0; i < graphicsData.length; i++) {
      const data = graphicsData[i]
      const shape = data.shape
      const fillStyle = data.fillStyle
      const lineStyle = data.lineStyle

      const fillColor = data.fillStyle.color | 0
      const lineColor = data.lineStyle.color | 0

      if (data.matrix) {
        throw `Not supported: ${data.matrix}`
      }

      if (fillStyle.visible) {
        const fillTint = (
          (((fillColor >> 16) & 0xFF) / 255 * tintR * 255 << 16)
          + (((fillColor >> 8) & 0xFF) / 255 * tintG * 255 << 8)
          + (((fillColor & 0xFF) / 255) * tintB * 255)
        )

        contextFillStyle = this._calcCanvasStyle(fillStyle, fillTint)
      }
      if (lineStyle.visible) {
        const lineTint = (
          (((lineColor >> 16) & 0xFF) / 255 * tintR * 255 << 16)
          + (((lineColor >> 8) & 0xFF) / 255 * tintG * 255 << 8)
          + (((lineColor & 0xFF) / 255) * tintB * 255)
        )

        contextStrokeStyle = this._calcCanvasStyle(lineStyle, lineTint)
      }

      context.lineWidth = lineStyle.width
      context.lineCap = lineStyle.cap
      context.lineJoin = lineStyle.join
      context.miterLimit = lineStyle.miterLimit

      if (data.type === SHAPES.POLY) {
        context.beginPath()

        const tempShape = shape as Polygon
        let points = tempShape.points
        const holes = data.holes
        let outerArea
        let innerArea
        let px
        let py

        context.moveTo(points[0], points[1])

        for (let j = 2; j < points.length; j += 2) {
          context.lineTo(points[j], points[j + 1])
        }

        if (tempShape.closeStroke) {
          context.closePath()
        }

        if (holes.length > 0) {
          outerArea = 0
          px = points[0]
          py = points[1]
          for (let j = 2; j + 2 < points.length; j += 2) {
            outerArea += ((points[j] - px) * (points[j + 3] - py))
              - ((points[j + 2] - px) * (points[j + 1] - py))
          }

          for (let k = 0; k < holes.length; k++) {
            points = (holes[k].shape as Polygon).points

            if (!points) {
              continue
            }

            innerArea = 0
            px = points[0]
            py = points[1]
            for (let j = 2; j + 2 < points.length; j += 2) {
              innerArea += ((points[j] - px) * (points[j + 3] - py))
                - ((points[j + 2] - px) * (points[j + 1] - py))
            }

            if (innerArea * outerArea < 0) {
              context.moveTo(points[0], points[1])

              for (let j = 2; j < points.length; j += 2) {
                context.lineTo(points[j], points[j + 1])
              }
            }
            else {
              context.moveTo(points[points.length - 2], points[points.length - 1])

              for (let j = points.length - 4; j >= 0; j -= 2) {
                context.lineTo(points[j], points[j + 1])
              }
            }

            if ((holes[k].shape as Polygon).closeStroke) {
              context.closePath()
            }
          }
        }

        if (fillStyle.visible) {
          context.globalAlpha = fillStyle.alpha
          context.fillStyle = contextFillStyle
          context.fill()
        }

        if (lineStyle.visible) {
          context.globalAlpha = lineStyle.alpha
          context.strokeStyle = contextStrokeStyle
          context.stroke()
        }
      }
      else if (data.type === SHAPES.RECT) {
        const tempShape = shape as Rectangle

        if (fillStyle.visible) {
          context.globalAlpha = fillStyle.alpha
          context.fillStyle = contextFillStyle
          context.fillRect(tempShape.x, tempShape.y, tempShape.width, tempShape.height)
        }
        if (lineStyle.visible) {
          context.globalAlpha = lineStyle.alpha
          context.strokeStyle = contextStrokeStyle
          context.strokeRect(tempShape.x, tempShape.y, tempShape.width, tempShape.height)
        }
      }
      else if (data.type === SHAPES.CIRC) {
        const tempShape = shape as Circle

        // TODO - need to be Undefined!
        context.beginPath()
        context.arc(tempShape.x, tempShape.y, tempShape.radius, 0, 2 * Math.PI)
        context.closePath()

        if (fillStyle.visible) {
          context.globalAlpha = fillStyle.alpha
          context.fillStyle = contextFillStyle
          context.fill()
        }

        if (lineStyle.visible) {
          context.globalAlpha = lineStyle.alpha
          context.strokeStyle = contextStrokeStyle
          context.stroke()
        }
      }
      else if (data.type === SHAPES.ELIP) {
        // ellipse code taken from: http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas

        const tempShape = shape as Ellipse

        const w = tempShape.width * 2
        const h = tempShape.height * 2

        const x = tempShape.x - (w / 2)
        const y = tempShape.y - (h / 2)

        context.beginPath()

        const kappa = 0.5522848
        const ox = (w / 2) * kappa // control point offset horizontal
        const oy = (h / 2) * kappa // control point offset vertical
        const xe = x + w // x-end
        const ye = y + h // y-end
        const xm = x + (w / 2) // x-middle
        const ym = y + (h / 2) // y-middle

        context.moveTo(x, ym)
        context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y)
        context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym)
        context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye)
        context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym)

        context.closePath()

        if (fillStyle.visible) {
          context.globalAlpha = fillStyle.alpha
          context.fillStyle = contextFillStyle
          context.fill()
        }
        if (lineStyle.visible) {
          context.globalAlpha = lineStyle.alpha
          context.strokeStyle = contextStrokeStyle
          context.stroke()
        }
      }
      else if (data.type === SHAPES.RREC) {
        const tempShape = shape as RoundedRectangle

        const rx = tempShape.x
        const ry = tempShape.y
        const width = tempShape.width
        const height = tempShape.height
        let radius = tempShape.radius

        const maxRadius = Math.min(width, height) / 2 | 0

        radius = radius > maxRadius ? maxRadius : radius

        context.beginPath()
        context.moveTo(rx, ry + radius)
        context.lineTo(rx, ry + height - radius)
        context.quadraticCurveTo(rx, ry + height, rx + radius, ry + height)
        context.lineTo(rx + width - radius, ry + height)
        context.quadraticCurveTo(rx + width, ry + height, rx + width, ry + height - radius)
        context.lineTo(rx + width, ry + radius)
        context.quadraticCurveTo(rx + width, ry, rx + width - radius, ry)
        context.lineTo(rx + radius, ry)
        context.quadraticCurveTo(rx, ry, rx, ry + radius)
        context.closePath()

        if (fillStyle.visible) {
          context.globalAlpha = fillStyle.alpha
          context.fillStyle = contextFillStyle
          context.fill()
        }
        if (lineStyle.visible) {
          context.globalAlpha = lineStyle.alpha
          context.strokeStyle = contextStrokeStyle
          context.stroke()
        }
      }
    }

    if (this._debug) {
      context.strokeStyle = '#00ff00'
      context.lineWidth = 1
      context.strokeRect(
        localBounds.x,
        localBounds.y,
        localBounds.width,
        localBounds.height,
      )

      context.textBaseline = 'top'
      context.fillStyle = 'black'
      context.font = '14px Arial'
      context.fillText(`@${resolution}x`, localBounds.x, localBounds.y)
    }

    _texture.trim.width = _texture._frame.width = size.width
    _texture.trim.height = _texture._frame.height = size.height
    _texture.orig.width = _texture._frame.width
    _texture.orig.height = _texture._frame.height
    _texture.updateUvs()
    _texture.baseTexture.setRealSize(canvas.width, canvas.height, resolution)

    this.shouldUpdateTexture = false
  }

  /**
   * calculates fill/stroke style for canvas
   *
   * @private
   * @param {PIXI.FillStyle} style
   * @param {number} tint
   * @returns {string|CanvasPattern}
   */
  private _calcCanvasStyle(style: FillStyle, tint: number): string | CanvasPattern {
    let res

    if (style.texture && style.texture.baseTexture !== Texture.WHITE.baseTexture) {
      if (style.texture.valid) {
        res = canvasUtils.getTintedPattern(style.texture, tint)
        this.setPatternTransform(res, style.matrix || Matrix.IDENTITY)
      }
      else {
        res = '#808080'
      }
    }
    else {
      res = `#${(`00000${(tint | 0).toString(16)}`).substr(-6)}`
    }

    return res
  }

  private setPatternTransform(pattern: CanvasPattern, matrix: Matrix): void {
    const m = new DOMMatrix([
      matrix.a,
      matrix.b,
      matrix.c,
      matrix.d,
      matrix.tx,
      matrix.ty,
    ])
    pattern.setTransform(m.inverse())
  }

  protected _render(renderer: Renderer): void {
    if (this.isMask) {
      // 被当作 mask 使用时，仍然通过 gl 绘制
      super._render(renderer)
    } else {
      this.finishPoly()
      this.updateTexture(renderer.resolution)
      this.calculateVertices()
      renderer.batch.setObjectRenderer(renderer.plugins['batch'])
      renderer.plugins['batch'].render(this)
    }
  }

  destroy(options: IDestroyOptions | boolean) {
    super.destroy(options)
    canvasPool.return(this.canvas)
  }

  protected _draw?: Draw<GraphicsElement> | null
  /**
   * 通过 props 设置 `draw` 时，立即调用他以便重绘
   */
  set draw(value: Draw<GraphicsElement> | null) {
    if (this._draw === value) {
      return
    }
    this._draw = value
    this.clear()
    if (this._draw) {
      this._draw(this)
    }
  }

  private _debug = DEBUG_GRAPHICS

  /**
   * Get or set if debug mode
   */
  get debug() {
    return this._debug
  }

  set debug(value: boolean) {
    if (value === this._debug) {
      return
    }
    this.shouldUpdateTexture = true
    this._debug = value
  }
}

// 3. Factory
export function createGraphics(props?: GraphicsProps) {
  const el = new GraphicsElement()
  if (props) {
    defaultApplyProps(el, props)
  }
  return el
}
