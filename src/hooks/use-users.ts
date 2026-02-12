import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useUsers() {
  const { data, error, isLoading } = useSWR("/api/users", fetcher);
  return {
    users: data?.data || [],
    isLoading,
    error,
  };
}
