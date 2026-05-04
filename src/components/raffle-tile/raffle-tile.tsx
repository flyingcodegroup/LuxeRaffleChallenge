import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Check } from 'lucide-react';
import Image from 'next/image';
import { Raffle } from '@/types/Raffle';
import { RaffleDetailsDialog } from '../raffle-details-dialog/raffle-details-dialog';
import { addToCart } from '@/server-functions/cart';
import { cn } from '@/lib/cn';

// flex-col with flex-grow on the description pins the action row to
// the bottom of every card so they line up across the grid regardless
// of description length.
export default function RaffleTile({
  raffle,
  quantityInCart,
  priority = false,
}: {
  raffle: Raffle;
  quantityInCart: number;
  priority?: boolean;
}) {
  const isSoldOut = raffle.availableTickets === 0;
  const isInCart = quantityInCart > 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
      <Image
        src={raffle.image || '/placeholder.svg'}
        alt={raffle.name}
        width={300}
        height={200}
        priority={priority}
        // Belt-and-braces: `priority` should already imply this, but
        // setting it explicitly ensures the rendered <img> always has
        // fetchpriority="high" — Next sometimes drops the attribute
        // in dev builds.
        fetchPriority={priority ? 'high' : undefined}
        // Tells Next.js what width to download per breakpoint —
        // matches the grid's columns: 1-4.
        sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="w-full h-48 object-cover"
      />
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h2 className="text-xl font-semibold">{raffle.name}</h2>
          <p className="text-2xl font-extrabold whitespace-nowrap text-primary leading-none">
            {raffle.ticketPrice}
            <span className="text-base font-bold ml-0.5">€</span>
          </p>
        </div>

        <Badge variant="outline" className="mb-2 self-start">
          {raffle.availableTickets} / {raffle.totalTickets} tickets left
        </Badge>

        <p className="text-gray-600 mb-4 flex-grow">{raffle.description}</p>

        <div className="flex justify-between gap-2">
          <form action={addToCart}>
            <input type="hidden" name="raffleId" value={raffle.id} />
            <Button
              variant={isInCart ? 'default' : 'outline'}
              type="submit"
              disabled={isSoldOut}
              className={cn(
                // Green = "added", visually distinct from View Details.
                isInCart && 'bg-emerald-600 hover:bg-emerald-700 text-white',
              )}
            >
              {isSoldOut ? (
                'Sold out'
              ) : isInCart ? (
                <>
                  <Check className="h-4 w-4" /> In cart ({quantityInCart})
                </>
              ) : (
                'Add to Cart'
              )}
            </Button>
          </form>
          <RaffleDetailsDialog raffle={raffle} />
        </div>
      </div>
    </div>
  );
}
