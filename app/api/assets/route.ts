// app/api/assets/route.ts

import { NextResponse } from "next/server";

// Ensure this route runs dynamically on the server (not static export)
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";
import { Asset } from "@/lib/data";
import { supabase, supabaseAdmin } from "@/lib/supabase";

// Fallback assets data for development when Supabase is not available
const fallbackAssets = [
  {
    id: "AS-1",
    name: "Commercial Space near Railway Station",
    type: "Commercial",
    location: "Mumbai Central",
    size: 1200,
    imageUrl: "/assets/commercial-space.jpg",
    status: "Available",
    dataAiHint: "Prime commercial space near Mumbai Central railway station",
    leaseType: "Long Term",
    geoLocation: "19.0760,72.8777",
    rent: 45000,
    amenities: ["Water", "Electricity", "Security"]
  },
  {
    id: "AS-2",
    name: "Warehouse Space",
    type: "Industrial",
    location: "Delhi Cantt",
    size: 5000,
    imageUrl: "/assets/warehouse.jpg",
    status: "Available",
    dataAiHint: "Large warehouse space in Delhi Cantonment area",
    leaseType: "Long Term",
    geoLocation: "28.5921,77.1536",
    rent: 120000,
    amenities: ["Loading Bay", "24x7 Access", "Security"]
  },
  {
    id: "AS-3",
    name: "Retail Kiosk",
    type: "Retail",
    location: "Bangalore City Junction",
    size: 100,
    imageUrl: "/assets/retail-kiosk.jpg",
    status: "Available",
    dataAiHint: "Small retail kiosk at Bangalore City Junction",
    leaseType: "Short Term",
    geoLocation: "12.9784,77.5738",
    rent: 15000,
    amenities: ["Electricity", "High Footfall"]
  }
];

// ---- Helpers ----
const parseGeoLocation = (geoLocation?: string) => {
  if (!geoLocation) return null;
  const parts = geoLocation.split(",").map((x) => parseFloat(x.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { lat: parts[0], lng: parts[1] };
  }
  return null;
};

const haversineDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const toAsset = (a: any): Asset => ({
  id: a.id,
  name: a.name,
  type: a.type,
  location: a.location,
  size: a.size,
  imageUrl: a.imageUrl ?? a.image_url ?? "",
  status: a.status ?? "Available",
  dataAiHint: a.dataAiHint ?? a.data_ai_hint ?? "",
  leaseType: a.leaseType ?? a.lease_type ?? undefined,
  availability:
    (a.availabilityFrom || a.availability_from) && (a.availabilityTo || a.availability_to)
      ? {
          from: new Date(a.availabilityFrom ?? a.availability_from).toISOString(),
          to: new Date(a.availabilityTo ?? a.availability_to).toISOString(),
        }
      : undefined,
  geoLocation: a.geoLocation ?? a.geo_location ?? undefined,
  rent: a.rent ?? undefined,
  amenities:
    Array.isArray(a.amenities)
      ? a.amenities
      : typeof a.amenities === "string"
      ? a.amenities.split(",").map((s: string) => s.trim()).filter(Boolean)
      : undefined,
});

// ---- API Routes ----
export async function GET(request: Request) {
  try {
    let assets: Asset[] = [];

    const tryFetchAssets = async (): Promise<Asset[]> => {
      const table = "Asset"; // Correct table name
      try {
        // Prefer server-side admin client if available to bypass RLS
        const db = supabaseAdmin ?? supabase;
        const { data: rows, error } = await db.from(table).select("*");
        if (error) {
          throw error;
        }
        return Array.isArray(rows) ? rows.map(toAsset) : [];
      } catch (err: any) {
        throw err;
      }
    };

    // If Supabase is configured, fetch real data only (no dummy fallback)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        // Add timeout protection
        const fetchPromise = tryFetchAssets();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Database request timed out")), 5000)
        );
        assets = await Promise.race([fetchPromise, timeoutPromise]) as Asset[];
      } catch (dbError: any) {
        console.error("Error fetching assets from Supabase:", dbError);
        // Return an error; do NOT substitute dummy data
        return NextResponse.json(
          { error: dbError.message || "Failed to load assets from database" },
          { status: 500 }
        );
      }
    } else {
      // Supabase not configured -> use local fallback for dev only
      console.warn("Supabase env not configured; returning local fallback assets");
      assets = fallbackAssets.map(toAsset);
    }
    
    // Process any query parameters
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const type = searchParams.get("type");
    const minSize = searchParams.get("minSize");
    const maxSize = searchParams.get("maxSize");
    const minRent = searchParams.get("minRent");
    const maxRent = searchParams.get("maxRent");
    const nearLat = searchParams.get("nearLat");
    const nearLng = searchParams.get("nearLng");
    const maxDistance = searchParams.get("maxDistance");

    let filteredAssets: Asset[] = assets;

    // Apply filters
    if (city) {
      filteredAssets = filteredAssets.filter((a: Asset) =>
        a.location.toLowerCase().includes(city.toLowerCase())
      );
    }

    if (type) {
      filteredAssets = filteredAssets.filter((a: Asset) => a.type === type);
    }

    if (minSize) {
      filteredAssets = filteredAssets.filter((a: Asset) => a.size >= parseInt(minSize));
    }

    if (maxSize) {
      filteredAssets = filteredAssets.filter((a: Asset) => a.size <= parseInt(maxSize));
    }

    if (minRent) {
      filteredAssets = filteredAssets.filter((a: Asset) => a.rent && a.rent >= parseInt(minRent));
    }

    if (maxRent) {
      filteredAssets = filteredAssets.filter((a: Asset) => a.rent && a.rent <= parseInt(maxRent));
    }

    if (nearLat && nearLng && maxDistance) {
      const lat = parseFloat(nearLat);
      const lng = parseFloat(nearLng);
      const maxDist = parseFloat(maxDistance);

      filteredAssets = filteredAssets.filter((a: Asset) => {
        const geo = parseGeoLocation(a.geoLocation);
        if (!geo) return false;
        const distance = haversineDistanceKm(lat, lng, geo.lat, geo.lng);
        return distance <= maxDist;
      });
    }

    return NextResponse.json({ data: filteredAssets }, { status: 200 });
  } catch (error) {
    console.error('Server error:', error);
    // Return JSON error, do not return dummy data
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = request.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
    
    // Check if admin token is required and provided
    if (process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Validate required fields
    if (!body.name || !body.type || !body.location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const amenities: string[] = Array.isArray(body.amenities)
      ? body.amenities
      : typeof body.amenities === "string"
      ? body.amenities.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];

    const id: string = body.id || `AS-${Date.now()}`;
    const availabilityFrom = body.availability?.from ? new Date(body.availability.from) : undefined;
    const availabilityTo = body.availability?.to ? new Date(body.availability.to) : undefined;

    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase environment variables not configured');
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    // Use the admin client to bypass RLS for server-side operations
    const supabaseClient = supabaseAdmin ?? supabase;
    
    if (!supabaseClient) {
      return NextResponse.json({ error: "Database client not configured" }, { status: 500 });
    }

    const row = {
      id,
      name: body.name,
      type: body.type,
      location: body.location,
      size: body.size,
      imageUrl: body.imageUrl || "",
      status: body.status || "Available",
      dataAiHint: body.dataAiHint || "",
      leaseType: body.leaseType || null,
      availabilityFrom: availabilityFrom || null,
      availabilityTo: availabilityTo || null,
      geoLocation: body.geoLocation || null,
      rent: body.rent ?? null,
      amenities,
      biddingEnabled: body.biddingEnabled ?? null,
      minBidAmount: body.minBidAmount ?? null,
      bidEndDate: body.bidEndDate ? new Date(body.bidEndDate) : null,
      updatedAt: new Date(), // Add updatedAt timestamp
    };

    // Helper: try insert into the correct table
    const tryInsert = async () => {
      const table = "Asset"; // Correct table name based on Prisma schema
      try {
        const { data, error } = await supabaseClient.from(table).insert(row).select("*").single();
        if (error) {
          console.error(`Supabase table '${table}' insert error:`, error);
          throw error;
        }
        return data;
      } catch (err) {
        throw err;
      }
    };

    try {
      const data = await tryInsert();
      return NextResponse.json({ data: toAsset(data) }, { status: 201 });
    } catch (dbError: any) {
      console.error("Database operation failed:", dbError);
      return NextResponse.json({ error: dbError.message || "Failed to save asset" }, { status: 500 });
    }
  } catch (e: any) {
    console.error("POST /api/assets error", e);
    return NextResponse.json({ error: e.message || "Internal error" }, { status: 500 });
  }
}
