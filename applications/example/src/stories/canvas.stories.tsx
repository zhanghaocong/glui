import { Canvas } from '@react-canvas-ui/renderer'
import { createElement, FC } from 'react'
import Bunny from './assets/bunny.png'

export const HelloWorld: FC = () => {
  const bunny = createElement('Image', { href: Bunny, anchor: [0, 0] })
  return (
    <Canvas>
      { bunny }
    </Canvas>
  )
}

export default {
  title: 'renderer/Canvas',
  decorators: [(Story: FC) => <div style={{ width: '100%', height: '100vh' }}><Story/></div>]
}
