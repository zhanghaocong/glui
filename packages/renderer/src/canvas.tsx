import { FC, memo } from 'react'

export const Canvas: FC = memo(() => {
  return (
    <div>
      <canvas style={{ display: 'block' }} />
    </div>
  )
})
