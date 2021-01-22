import { FC, useEffect } from 'react'
import StatsJS from 'stats.js'

export const Stats: FC = () => {

  useEffect(() => {
    const inst = new StatsJS()
    inst.dom.style.left = ''
    inst.dom.style.right = '0'
    document.body.append(inst.dom)

    let rafId: number
    const update = () => {
      inst.update()
      rafId = requestAnimationFrame(update)
    }
    update()
    return () => {
      cancelAnimationFrame(rafId)
      inst.dom.remove()
    }
  }, [])

  return null
}