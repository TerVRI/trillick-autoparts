export type SiteImageKey =
  | "heroHome"
  | "shopBanner"
  | "catalogueBanner"
  | "toolsBanner"
  | "aboutBanner"
  | "contactBanner"
  | "locationBanner"
  | "deliveryBanner"
  | "genericBanner";

export interface SiteImage {
  src: string;
  alt: string;
  credit: string;
}

export const siteImages: Record<SiteImageKey, SiteImage> = {
  heroHome: {
    src: "/images/vehicles/hero-range-rover.jpg",
    alt: "Black Range Rover on a gravel road through forest",
    credit: "Unsplash (Ho98UeVC_nQ)",
  },
  shopBanner: {
    src: "/images/vehicles/defender-offroad.jpg",
    alt: "Gray Land Rover Range Rover on open terrain",
    credit: "Unsplash (xWeSCy5BdfI)",
  },
  catalogueBanner: {
    src: "/images/vehicles/white-defender.jpg",
    alt: "White Land Rover Defender",
    credit: "Unsplash (j0YPbvXu4t0)",
  },
  toolsBanner: {
    src: "/images/vehicles/offroad-muddy.jpg",
    alt: "Muddy Land Rover Defender driving through rough terrain",
    credit: "Brian Kungu / Unsplash (yhkhCz9cU58)",
  },
  aboutBanner: {
    src: "/images/vehicles/classic-defender.jpg",
    alt: "Black Land Rover Range Rover SUV",
    credit: "Yusuf Evli / Unsplash (cl6XFFFv3n0)",
  },
  contactBanner: {
    src: "/images/vehicles/yellow-defender.jpg",
    alt: "Yellow Land Rover Defender parked on a grassy field",
    credit: "Unsplash (Tg4u_uEUAes)",
  },
  locationBanner: {
    src: "/images/vehicles/discovery-forest.jpg",
    alt: "Land Rover Discovery Sport in a forest",
    credit: "Unsplash (_oAvofc83Sw)",
  },
  deliveryBanner: {
    src: "/images/vehicles/discovery-beach.jpg",
    alt: "White Land Rover on a beach",
    credit: "Unsplash (nYjxQBw9DLs)",
  },
  genericBanner: {
    src: "/images/vehicles/defender-offroad.jpg",
    alt: "Land Rover on open terrain",
    credit: "Unsplash (xWeSCy5BdfI)",
  },
};

const staticPageImageMap: Record<string, SiteImageKey> = {
  "About Us": "aboutBanner",
  "Contact Us": "contactBanner",
  Location: "locationBanner",
  FAQs: "genericBanner",
  Delivery: "deliveryBanner",
  "Returns Policy": "genericBanner",
  "Terms & Conditions": "genericBanner",
};

export function getStaticPageImageKey(title: string): SiteImageKey {
  return staticPageImageMap[title] ?? "genericBanner";
}

export function getStaticPageImage(title: string): SiteImage {
  return siteImages[getStaticPageImageKey(title)];
}

export function getSiteImage(key: SiteImageKey): SiteImage {
  return siteImages[key];
}

/** Homepage about-blurb section accent image */
export const homeAboutImage: SiteImage = siteImages.contactBanner;
