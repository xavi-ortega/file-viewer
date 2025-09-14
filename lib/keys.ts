import { QueryKey } from "@tanstack/react-query";

export const connChildrenKey = (connectionId: string, resourceId?: string) =>
  ["conn", "children", { connectionId, resourceId }] as const;

export const kbChildrenKey = (kbId: string, resourcePath?: string) =>
  ["kb", "children", { kbId, resourcePath }] as const;

export function isConnKey(k: QueryKey) {
  return Array.isArray(k) && k[0] === "conn" && k[1] === "children";
}

export function isKbKey(k: QueryKey, kbId: string) {
  return (
    Array.isArray(k) &&
    k[0] === "kb" &&
    k[1] === "children" &&
    k[2]?.kbId === kbId
  );
}
