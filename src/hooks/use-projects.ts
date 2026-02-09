import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useProjects(search?: string) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  const query = params.toString();
  return useSWR(`/api/projects${query ? `?${query}` : ""}`, fetcher);
}

export function useProject(id: string) {
  return useSWR(id ? `/api/projects/${id}` : null, fetcher);
}
