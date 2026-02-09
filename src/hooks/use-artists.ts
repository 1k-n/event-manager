import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useArtists(search?: string) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  const query = params.toString();
  return useSWR(`/api/artists${query ? `?${query}` : ""}`, fetcher);
}

export function useArtist(id: string) {
  return useSWR(id ? `/api/artists/${id}` : null, fetcher);
}
