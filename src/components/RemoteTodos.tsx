import { lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";

// @ts-expect-error – remotePwa is a runtime Module Federation remote, not a static TS module
const Todos = lazy(() => import("remotePwa/Todos"));

interface TestItem {
  id?: string;
  city: string;
  createdAt?: string;
}

async function fetchTestItems(): Promise<TestItem[]> {
  const res = await fetch(
    "https://69a15b962e82ee536fa0f03a.mockapi.io/api/v1/test",
  );
  if (!res.ok) throw new Error("Failed to fetch test items");
  return res.json();
}

export default function RemoteTodos() {
  const { data, isLoading, isError } = useQuery<TestItem[]>({
    queryKey: ["testItems"],
    queryFn: fetchTestItems,
  });

  return (
    <div>
      {/* <Suspense fallback={<div>Loading Todos...</div>}>
        <Todos />
      </Suspense> */}

      {isLoading && <div>Loading test items...</div>}
      {isError && <div>Error loading test items.</div>}
      {data && (
        <ul>
          {data.map((item, index) => (
            <li key={item.id ?? index}>{item.city}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
