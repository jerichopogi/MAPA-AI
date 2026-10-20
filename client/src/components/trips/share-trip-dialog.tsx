import { useState } from "react";
import { Check, Copy, Link2, Loader2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUpdateTrip } from "@/hooks/use-trips";
import { useI18n } from "@/lib/i18n";
import type { Trip } from "@/lib/types";

/** 22-character URL-safe random token (~128 bits) — unguessable share links. */
function newShareId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export const shareUrl = (shareId: string) => `${window.location.origin}/s/${shareId}`;

export function ShareTripDialog({ trip }: { trip: Trip }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const update = useUpdateTrip(trip.id);
  const [copied, setCopied] = useState(false);
  const url = trip.shareId ? shareUrl(trip.shareId) : "";

  const enable = () =>
    update.mutate({ shareId: newShareId() }, { onError: (e) => toast({ title: "Couldn't create link", description: e.message, variant: "destructive" }) });
  const disable = () =>
    update.mutate({ shareId: null }, { onSuccess: () => toast({ title: "Sharing turned off", description: "The old link no longer works." }) });

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const message = `Check out our ${trip.name} itinerary on MAPA AI ✈️`;
  const canNativeShare = typeof navigator !== "undefined" && "share" in navigator;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share2 /> {t("Share")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="display text-2xl">Share this trip</DialogTitle>
          <DialogDescription>
            Anyone with the link can view the itinerary and booking links — perfect for the barkada group chat. Your notes and account stay private.
          </DialogDescription>
        </DialogHeader>

        {!trip.shareId ? (
          <Button onClick={enable} disabled={update.isPending}>
            {update.isPending ? <Loader2 className="animate-spin" /> : <Link2 />} Create share link
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input readOnly value={url} onFocus={(e) => e.target.select()} aria-label="Share link" />
              <Button size="icon" variant="outline" onClick={copy} aria-label="Copy link">
                {copied ? <Check /> : <Copy />}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {canNativeShare && (
                <Button size="sm" onClick={() => navigator.share({ title: trip.name, text: message, url }).catch(() => {})}>
                  <Share2 /> Share…
                </Button>
              )}
              <Button size="sm" variant="outline" asChild>
                {/* Opens the Messenger app on phones; on desktop, use Copy link. */}
                <a href={`fb-messenger://share/?link=${encodeURIComponent(url)}`}>Messenger</a>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href={`viber://forward?text=${encodeURIComponent(`${message} ${url}`)}`}>Viber</a>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href={`https://wa.me/?text=${encodeURIComponent(`${message} ${url}`)}`} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              </Button>
            </div>
            <button onClick={disable} disabled={update.isPending} className="text-xs text-muted-foreground underline-offset-4 hover:text-destructive hover:underline">
              Stop sharing (the link will stop working)
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
