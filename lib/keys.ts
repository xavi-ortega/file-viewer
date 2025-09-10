export const connChildrenKey = (connectionId: string, resourceId?: string) =>
  ["conn", "children", { connectionId, resourceId }] as const;

export const kbChildrenKey = (kbId: string, resourcePath?: string) =>
  ["kb", "children", { kbId, resourcePath }] as const;
