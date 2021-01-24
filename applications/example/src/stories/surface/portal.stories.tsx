import { Container, createElement, createPortal, Surface, Text } from '@react-canvas-ui/core'
import { FC, useRef, useState } from 'react'

export const Portal: FC = () => {
  const [resolveStage, portalContainer] = usePortalContainer()
  return (
    <Surface>
      <Container ref={resolveStage} key="c1" x={100} y={75}>
        <Text content='普通创建' />
        { createPortal(<Text content='通过 createPortal 创建' x={100} />, portalContainer) }
      </Container>
    </Surface>
  )
}

const usePortalContainer = () => {
  const [portalContainer] = useState(() => {
    return createElement('Container')
  })
  const stage = useRef<Container>()

  // TODO 优化 Stage 获取方式
  const resolveStage = (instance: Container) => {
    const nextStage = instance?.parent as Container
    if (nextStage === stage.current) {
      return
    }
    if (nextStage) {
      nextStage.removeChild(portalContainer)
    }
    stage.current = nextStage
    if (nextStage) {
      nextStage.addChild(portalContainer)
    }
  }
  return [resolveStage, portalContainer] as const
}
