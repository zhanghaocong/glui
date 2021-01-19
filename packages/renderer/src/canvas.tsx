import { AbstractRenderer } from '@pixi/core'
import { createContext, ReactNode, useEffect, useLayoutEffect } from 'react'

type CanvasState = {
  left: number
  top: number
  width: number
  height: number
  gl: AbstractRenderer
}

export const CanvasStateContext = createContext({} as CanvasState) // TODO makealwaysthrowobject

export type UseCanvasOptions = {
  gl: AbstractRenderer
  left: number
  top: number
  width: number
  height: number
  children: ReactNode
}
export const useCanvas = ({
  gl,
  width,
  height,
  children
}: UseCanvasOptions) => {
  useEffect(() => {
    gl.resize(width, height)
  }, [gl, width, height])

  useLayoutEffect(() => {
    console.info('mount')
    console.info(children)

    return () => {
      console.info('unmount children changed')
    }
  }, [children])
}
