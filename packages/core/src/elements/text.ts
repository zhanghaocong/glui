import {Text} from '@pixi/text'
import { ContainerProps } from './container'
import { defaultApplyProps } from './utils'

export type TextProps = {
  text: string
} & ContainerProps

export function createText ({
  text = '',
  ...props
}: TextProps) {
  const el = new Text(text)
  if (props) {
    defaultApplyProps(el, props)
  }
  return el
}
