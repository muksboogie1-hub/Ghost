import type { BusinessCategory, CityZimbabwe } from '../types';

export interface OSMBusinessCandidate {
  id: string;
  osmType: 'node' | 'way' | 'relation';
  name: string;
  category: BusinessCategory;
  address?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  latitude?: number;
  longitude?: number;
  sourceUrl: string;
}

export interface OSMDiscoveryResponse {
  results: OSMBusinessCandidate[];
  cached: boolean;
  fetchedAt: string;
}

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassPayload {
  elements?: OverpassElement[];
  remark?: string;
}

const ENDPOINT = 'https://overpass-api.de/api/interpreter';
const CACHE_TTL_MS = 30 * 60 * 1000;
const RADIUS_METERS = 10000;
const RESULT_LIMIT = 80;

// Approximate city centres used only to define a small local search radius.
const CITY_CENTRES: Partial<Record<CityZimbabwe, [number, number]>> = {
  Harare: [-17.8252, 31.0335],
  Bulawayo: [-20.1520, 28.5830],
  Mutare: [-18.9707, 32.6709],
  Gweru: [-19.4550, 29.8179],
  Masvingo: [-20.0730, 30.8320],
  Chitungwiza: [-18.0127, 31.0756],
  Kwekwe: [-18.9280, 29.8149],
  'Victoria Falls': [-17.9318, 25.8307],
  Kadoma: [-18.3333, 29.9167],
  Marondera: [-18.1853, 31.5519],
  Norton: [-17.8833, 30.7000],
  Zvishavane: [-20.3267, 30.0665],
};

// Filters are restricted to relevant named POIs so each scan stays small.
const CATEGORY_FILTERS: Record<BusinessCategory, string[]> = {
  'Tombstone & Granite': [
    '["craft"="stonemason"]',
    '["shop"="building_materials"]',
  ],
  'Restaurants & Cafés': [
    '["amenity"~"^(restaurant|cafe|fast_food|food_court)$"]',
  ],
  'Private Hospitals & Clinics': [
    '["amenity"~"^(clinic|hospital|doctors|dentist)$"]',
    '["healthcare"~"^(clinic|hospital|doctor|dentist)$"]',
  ],
  'Bakeries & Food': [
    '["shop"="bakery"]',
    '["amenity"~"^(restaurant|cafe|fast_food)$"]',
  ],
  'Hotels & Lodges': [
    '["tourism"~"^(hotel|guest_house|motel|hostel|chalet)$"]',
  ],
  'Construction & Hardware': [
    '["shop"~"^(hardware|building_materials)$"]',
    '["craft"~"^(builder|electrician|plumber)$"]',
  ],
  'Furniture & Home Décor': [
    '["shop"~"^(furniture|interior_decoration|houseware)$"]',
  ],
  'Legal & Accounting': [
    '["office"~"^(lawyer|accountant)$"]',
  ],
  'Automotive & Spares': [
    '["shop"~"^(car_repair|car_parts|tyres|car)$"]',
  ],
  'Solar & Clean Energy': [
    '["shop"="electrical"]',
    '["craft"="electrician"]',
  ],
  'Education & Training': [
    '["amenity"~"^(school|college|university|language_school)$"]',
    '["office"="educational_institution"]',
  ],
  'Retail & Wholesale': [
    '["shop"~"^(supermarket|department_store|wholesale|convenience)$"]',
  ],
  'Beauty & Wellness': [
    '["shop"~"^(beauty|hairdresser|massage|cosmetics)$"]',
    '["amenity"="spa"]',
  ],
  'Other Business': [
    '["shop"]',
    '["office"="company"]',
  ],
};

function cacheKey(city: CityZimbabwe, category: BusinessCategory): string {
  return 'project_ghost_osm_v1:' + city + ':' + category;
}

function firstTag(tags: Record<string, string>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = tags[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

function normalizeWebsite(value?: string): string | undefined {
  if (!value) return undefined;
  const candidate = value.trim();
  if (!candidate) return undefined;
  if (/^https?:\/\//i.test(candidate)) return candidate;
  // OSM frequently stores hostnames without a scheme; HTTPS is a display default,
  // not a claim that the website is reachable or its certificate is valid.
  if (/^[a-z0-9.-]+\.[a-z]{2,}([/:?#].*)?$/i.test(candidate)) return 'https://' + candidate;
  return candidate;
}

function formatAddress(tags: Record<string, string>): string | undefined {
  const full = firstTag(tags, 'addr:full');
  if (full) return full;
  const streetLine = [
    firstTag(tags, 'addr:housenumber'),
    firstTag(tags, 'addr:street'),
  ].filter(Boolean).join(' ');
  const locality = [
    firstTag(tags, 'addr:suburb', 'addr:neighbourhood'),
    firstTag(tags, 'addr:city', 'addr:town', 'addr:village'),
  ].filter(Boolean).join(', ');
  const address = [streetLine, locality].filter(Boolean).join(', ');
  return address || undefined;
}

function toCandidate(
  element: OverpassElement,
  category: BusinessCategory,
): OSMBusinessCandidate | null {
  const tags = element.tags ?? {};
  const name = firstTag(tags, 'name', 'brand', 'operator');
  if (!name) return null;

  const location = element.center ?? (
    typeof element.lat === 'number' && typeof element.lon === 'number'
      ? { lat: element.lat, lon: element.lon }
      : undefined
  );

  const type = element.type;
  return {
    id: type + '/' + element.id,
    osmType: type,
    name,
    category,
    address: formatAddress(tags),
    phone: firstTag(tags, 'contact:phone', 'phone', 'telephone'),
    whatsapp: firstTag(tags, 'contact:whatsapp', 'whatsapp'),
    email: firstTag(tags, 'contact:email', 'email'),
    website: normalizeWebsite(firstTag(tags, 'contact:website', 'website', 'url')),
    facebook: firstTag(tags, 'contact:facebook', 'facebook'),
    instagram: firstTag(tags, 'contact:instagram', 'instagram'),
    latitude: location?.lat,
    longitude: location?.lon,
    sourceUrl: 'https://www.openstreetmap.org/' + type + '/' + element.id,
  };
}

function readCache(city: CityZimbabwe, category: BusinessCategory): OSMDiscoveryResponse | null {
  try {
    const raw = localStorage.getItem(cacheKey(city, category));
    if (!raw) return null;
    const cached = JSON.parse(raw) as OSMDiscoveryResponse;
    if (!cached.fetchedAt || Date.now() - Date.parse(cached.fetchedAt) > CACHE_TTL_MS) return null;
    if (!Array.isArray(cached.results)) return null;
    return { ...cached, cached: true };
  } catch {
    return null;
  }
}

function writeCache(city: CityZimbabwe, category: BusinessCategory, result: OSMDiscoveryResponse): void {
  try {
    localStorage.setItem(cacheKey(city, category), JSON.stringify(result));
  } catch {
    // The live search still works if browser storage is unavailable or full.
  }
}

/**
 * Fetch a small, user-triggered OpenStreetMap Overpass search.
 * This returns map candidates only; absence of a website tag is NOT proof that
 * the business has no website, and the candidate is never auto-contacted.
 */
export async function discoverOSMBusinesses(
  city: CityZimbabwe,
  category: BusinessCategory,
): Promise<OSMDiscoveryResponse> {
  const cached = readCache(city, category);
  if (cached) return cached;

  const centre = CITY_CENTRES[city];
  if (!centre) {
    throw new Error('Choose a specific Zimbabwean city. “Other Zimbabwe” does not define a safe search area.');
  }

  const [lat, lon] = centre;
  const filters = CATEGORY_FILTERS[category];
  const query = [
    '[out:json][timeout:20];',
    '(',
    ...filters.map((filter) => `  nwr(around:${RADIUS_METERS},${lat},${lon})["name"]${filter};`),
    ');',
    `out center tags ${RESULT_LIMIT};`,
  ].join('\n');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: 'data=' + encodeURIComponent(query),
      signal: controller.signal,
    });

    if (response.status === 429 || response.status === 503) {
      throw new Error('OpenStreetMap search is busy or rate-limited. Wait at least 30 seconds before trying again.');
    }
    if (!response.ok) {
      throw new Error('OpenStreetMap search failed (HTTP ' + response.status + '). Try again later.');
    }

    const payload = await response.json() as OverpassPayload;
    if (!Array.isArray(payload.elements)) {
      throw new Error(payload.remark || 'OpenStreetMap returned an unexpected response.');
    }

    const unique = new Map<string, OSMBusinessCandidate>();
    for (const element of payload.elements) {
      const candidate = toCandidate(element, category);
      if (candidate) unique.set(candidate.id, candidate);
    }

    const results = [...unique.values()]
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, RESULT_LIMIT);

    const result: OSMDiscoveryResponse = {
      results,
      cached: false,
      fetchedAt: new Date().toISOString(),
    };
    writeCache(city, category, result);
    return result;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('OpenStreetMap search timed out. Try again later; the public service can be busy.');
    }
    throw error instanceof Error ? error : new Error('OpenStreetMap search failed unexpectedly.');
  } finally {
    clearTimeout(timeout);
  }
}
