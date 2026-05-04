import { getOrders } from '@/server-functions/getOrders';
import { getRaffles } from '@/server-functions/getRaffles';
import type { Order } from '@/types/Order';

// Wrapped in <Suspense> on the account page. The slow orders fetch
// stays inside this component, so the page shell streams immediately
// and only this section waits behind a skeleton.
export async function OrdersList() {
  let orders: Order[] = [];
  let ordersFailed = false;
  try {
    orders = await getOrders();
  } catch {
    ordersFailed = true;
  }

  const raffles = await getRaffles();
  const rafflesById = new Map(raffles.map((r) => [r.id, r]));

  if (ordersFailed) {
    return (
      <p className="text-sm text-gray-600">
        We couldn&apos;t load your orders right now. Please refresh in a
        moment.
      </p>
    );
  }

  if (orders.length === 0) {
    return <p>You haven&apos;t purchased any tickets yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {orders.map((order) => (
        <li key={order.id} className="border-b pb-4 last:border-b-0">
          <p className="text-sm text-gray-500">
            Order #{order.id.slice(0, 8)}
          </p>
          <ul className="mt-2 space-y-1">
            {order.items.map((item) => {
              const raffle = rafflesById.get(item.id);
              return (
                <li key={item.id}>
                  {item.quantity} × {raffle?.name ?? `Raffle #${item.id}`}
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ul>
  );
}

// Rough shape of a real order row so the layout doesn't jump on swap.
export function OrdersListSkeleton() {
  return (
    <ul className="space-y-4" aria-hidden="true">
      {[0, 1].map((i) => (
        <li
          key={i}
          className="border-b pb-4 last:border-b-0 animate-pulse"
        >
          <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-48 bg-gray-200 rounded" />
        </li>
      ))}
    </ul>
  );
}
