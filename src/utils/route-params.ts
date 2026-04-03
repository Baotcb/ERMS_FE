export async function resolveRouteParams<T>(params: T | Promise<T>): Promise<T> {
  return await params
}

export async function resolveRouteId(
  params: { id: string } | Promise<{ id: string }>
): Promise<string> {
  const resolved = await resolveRouteParams(params)
  return resolved.id
}
