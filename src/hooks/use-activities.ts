import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useActivities(projectId?: string, limit = 50, offset = 0) {
  const params = new URLSearchParams();
  if (projectId) params.set("projectId", projectId);
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  const query = params.toString();

  return useSWR(`/api/activities?${query}`, fetcher);
}
