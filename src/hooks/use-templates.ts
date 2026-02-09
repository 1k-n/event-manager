import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useTemplates(type?: string) {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  const query = params.toString();
  return useSWR(`/api/templates${query ? `?${query}` : ""}`, fetcher);
}

export function useTemplate(id: string) {
  return useSWR(id ? `/api/templates/${id}` : null, fetcher);
}
