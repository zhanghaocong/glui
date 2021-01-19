import { AbstractRenderer } from '@pixi/core'
import { Container } from '@pixi/display'
import { Ticker } from '@pixi/ticker'
import { createContext, ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'

type CanvasState = {
  left: number
  top: number
  width: number
  height: number
  gl: AbstractRenderer
  stage: Container
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

  const [{
    stage,
    defaultContainer,
    ticker,
  }] = useState(() => {
    return {
      // 根节点，相当于 `document.body`
      stage: new Container(),

      // 默认容器，相当于 `document.body.querySelector('#root')`
      defaultContainer: new Container(),

      ticker: Ticker.shared,
    }
  })

  const state: CanvasState = useMemo(() => {
    return {

    }
  }, [])

  const [Bridge] = useState(() => {
    return function Bridge (props: { children: ReactNode }) {
      useEffect(() => {
        console.info('Bridged')
      }, [])
      return props.children
    }
  })

  useLayoutEffect(() => {

  }, [Bridge, children])
  
  useLayoutEffect(() => {
    return () => {
      console.info('dispose')
    }
  }, [])

  // 主循环
  useLayoutEffect(() => {
    const loop = () => {
      gl.render(stage)
    }
    ticker.add(loop)
    return () => {
      ticker.remove(loop)
    }
  }, [gl, ticker, stage])

  // 缩放
  useEffect(() => {
    gl.resize(width, height)
  }, [gl, width, height])

}
