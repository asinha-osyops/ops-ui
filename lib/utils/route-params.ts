/**
 * Safely extract a string param from Next.js route params.
 * `useParams()` returns `string | string[] | undefined` for dynamic segments.
 */
export function getStringParam(param: string | string[] | undefined): string {
  if (typeof param === 'string') return param
  if (Array.isArray(param) && param.length > 0) return param[0]
  return ''
}
