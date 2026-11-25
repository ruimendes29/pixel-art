import { useCallback, useEffect, useState } from "react";
import { field, MAX_TAGS_CREATED_PER_USER } from "../../fields/validate";
import useHttp, { COMMON_URL } from "../../hooks/use-http";

// From the shared field rules (fields/fields.json), which the backend applies too
export const MAX_TAG_LENGTH = field("tag").maxLength!;

const sameTag = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

export const hasTag = (tags: string[], tag: string) => tags.some((t) => sameTag(t, tag));

// Selects the tag, or deselects it if it is already selected (ignoring case).
export const toggleTag = (selected: string[], tag: string) =>
  hasTag(selected, tag) ? selected.filter((t) => !sameTag(t, tag)) : [...selected, tag];

export type TagCatalog = { tags: string[]; createdByMe: number; maxPerUser: number };

// The shared tag catalog (GET /api/tags): every tag anyone can pick, and how many
// the logged-in user created. `create` adds one for everybody.
export const useTagCatalog = () => {
  const [, sendRequest] = useHttp();
  const [createInfo, sendCreate] = useHttp();
  const [catalog, setCatalog] = useState<TagCatalog>({
    tags: [],
    createdByMe: 0,
    maxPerUser: MAX_TAGS_CREATED_PER_USER,
  });

  const load = useCallback(async () => {
    const token = localStorage.getItem("token");
    const res = await sendRequest({ url: `${COMMON_URL}/tags${token ? `?key=${token}` : ""}` });
    if (res) setCatalog(res);
  }, [sendRequest]);

  useEffect(() => {
    load();
  }, [load]);

  // The tag's stored name, or undefined if refused (the reason is in createError)
  const create = async (name: string): Promise<string | undefined> => {
    const res = await sendCreate({
      url: `${COMMON_URL}/tags`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: localStorage.getItem("token"), name }),
    });
    if (!res) return undefined;
    await load();
    return res.name;
  };

  return { ...catalog, create, creating: createInfo.isLoading, createError: createInfo.error?.message };
};
