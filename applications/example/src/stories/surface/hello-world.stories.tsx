import { Surface, Container, Sprite } from '@react-canvas-ui/core'
import { FC } from 'react'
import BunnyImage from '../assets/bunny.png'

export const HelloWorld: FC = () => {
  return (
    <Surface>
      <Container key="c1" x={0} y={0}>
        <Sprite href={BunnyImage} x={100} y={100} />
      </Container>
      <Container key="c2" x={200} y={0}>
        <Sprite href={BunnyImage} x={100} y={100} />
      </Container>
    </Surface>
  )
}
