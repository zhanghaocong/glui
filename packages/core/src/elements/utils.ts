import type { ElementProps, UpdatePayload } from './types'

export const defaultApplyProps = (el: any, props: ElementProps) => {
  console.info(el)
  for (const key in props) {
    set(el, key, props[key])
  }
}

const set = <T>(el: any, key: string, value: T) => {
  if (key === 'children') {
    // 不支持文本节点
    return
  }
  el[key] = value
}

export const defaultApplyUpdate = (el: any, payload: UpdatePayload) => {
  for (let i = 0; i < payload.length; i += 2) {
    const key = payload[i]
    const value = payload[i+1]
    el[key] = value
  }
}

export const defaultDiffProps = (prevProps: ElementProps, nextProps: ElementProps) => {
  return []
}