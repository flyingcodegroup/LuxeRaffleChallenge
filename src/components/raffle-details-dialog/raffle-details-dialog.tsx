'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Raffle } from '@/types/Raffle';

// Client island for the trigger + dialog. The surrounding raffle
// tile stays server-rendered. Detailed raffle pages are follow-up
// scope — for now this gives the click a destination.
export function RaffleDetailsDialog({ raffle }: { raffle: Raffle }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>View Details</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{raffle.name}</DialogTitle>
          <DialogDescription>Coming soon</DialogDescription>
        </DialogHeader>
        <div className="overflow-hidden rounded-md">
          {/* Same width/height/sizes as the tile so the dialog reuses
              the optimized image variant the grid already downloaded —
              the picture appears instantly instead of triggering a
              second fetch for a different /_next/image?w=... URL. */}
          <Image
            src={raffle.image}
            alt={raffle.name}
            width={300}
            height={200}
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="w-full h-56 object-cover"
          />
        </div>
        <p className="text-sm text-gray-600">
          A detailed raffle page with full specs, photo gallery, and
          ticket purchase flow is on the way. For now, you can add
          tickets to your cart from the card.
        </p>
      </DialogContent>
    </Dialog>
  );
}
