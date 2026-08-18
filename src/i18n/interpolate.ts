import type { Message, MessageParams } from './types'

const PLACEHOLDER = /\{(\w+)\}/g

/**
 * Picks the plural branch and substitutes `{placeholders}`.
 *
 * The plural rule here is deliberately the English one (exactly 1 is
 * singular). Languages without plural inflection, Vietnamese among them, keep
 * their whole phrase in `other` and never notice; a future language with
 * richer rules would need its own selector, which is why the choice is made in
 * one place.
 */
export function formatMessage(
  message: Message,
  params: MessageParams | undefined,
  usePluralForms: boolean,
): string {
  const template = selectBranch(message, params, usePluralForms)

  if (!params) {
    return template
  }

  return template.replace(PLACEHOLDER, (match, name: string) => {
    const value = params[name]
    return value === undefined ? match : String(value)
  })
}

function selectBranch(
  message: Message,
  params: MessageParams | undefined,
  usePluralForms: boolean,
): string {
  if (typeof message === 'string') {
    return message
  }

  if (!usePluralForms) {
    return message.other
  }

  const count = Number(params?.count)
  if (count === 0 && message.zero !== undefined) {
    return message.zero
  }
  return count === 1 ? message.one : message.other
}
