// Destination photos, shared by the client and the server (link previews, emails).

export const unsplash = (id: string, w = 800) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

const COUNTRY_PHOTO_IDS: Record<string, string> = {
  JPN: "photo-1493976040374-85c8e12f0c0e",
  KOR: "photo-1538485399081-7191377e8241",
  SGP: "photo-1525625293386-3f8f99389edd",
  THA: "photo-1508009603885-50cf7c579365",
  VNM: "photo-1528127269322-539801943592",
  MYS: "photo-1596422846543-75c6fc197f07",
  IDN: "photo-1537996194471-e657df975ab4",
  HKG: "photo-1536599018102-9f803c140fc1",
  TWN: "photo-1470004914212-05527e49370b",
  AUS: "photo-1506973035872-a4ec16b8e8d9",
  USA: "photo-1485871981521-5b1fd3805eee",
  CAN: "photo-1503614472-8c93d56e92ce",
  GBR: "photo-1513635269975-59663e0ac1ad",
  FRA: "photo-1502602898657-3e91760cbb34",
  ITA: "photo-1515542622106-78bda8ba0e5b",
  ESP: "photo-1539037116277-4db20889f2d4",
};
const DEFAULT_PHOTO_ID = "photo-1488646953014-85cb44e25828";

export const COUNTRY_IMAGES: Record<string, string> = Object.fromEntries(
  Object.entries(COUNTRY_PHOTO_IDS).map(([code, id]) => [code, unsplash(id)]),
);
export const DEFAULT_TRIP_IMAGE = unsplash(DEFAULT_PHOTO_ID);

/** Cover photo for a destination; `width` lets previews ask for a larger image. */
export const countryImage = (code: string, width = 800) => unsplash(COUNTRY_PHOTO_IDS[code] ?? DEFAULT_PHOTO_ID, width);
