import { getLocation } from "@/lib/site-content";

interface LocationMapProps {
  height?: number;
  zoom?: number;
  className?: string;
}

export function LocationMap({ height = 420, zoom = 15, className = "" }: LocationMapProps) {
  const { lat, lng, address } = getLocation();
  const embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;

  return (
    <div className={className}>
      <iframe
        title={`Map showing ${address}`}
        src={embedUrl}
        width="100%"
        height={height}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="rounded-lg border border-stone-200"
        allowFullScreen
      />
      <p className="mt-3 text-sm text-stone-500">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-700 hover:underline"
        >
          Open in Google Maps
        </a>
      </p>
    </div>
  );
}
