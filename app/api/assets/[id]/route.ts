// app/api/assets/[id]/route.ts

import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { Asset } from "@/lib/data";

// Minimal normalizer to keep response shape consistent with Asset
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = request.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
    if (process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Normalize update payload for snake_case columns
    const updateRow: any = {
      name: body.name,
      type: body.type,
      location: body.location,
      size: body.size,
      image_url: body.imageUrl ?? body.image_url ?? null,
      status: body.status ?? null,
      data_ai_hint: body.dataAiHint ?? body.data_ai_hint ?? null,
      lease_type: body.leaseType ?? body.lease_type ?? null,
      availability_from: body.availability?.from
        ? new Date(body.availability.from)
        : body.availability_from ?? null,
      availability_to: body.availability?.to
        ? new Date(body.availability.to)
        : body.availability_to ?? null,
      geo_location: body.geoLocation ?? body.geo_location ?? null,
      rent: body.rent ?? null,
      amenities:
        Array.isArray(body.amenities)
          ? body.amenities
          : typeof body.amenities === "string"
          ? body.amenities.split(",").map((s: string) => s.trim()).filter(Boolean)
          : null,
    };

    // Prefer admin client for server-side writes; fall back to anon
    const supabaseClient = supabaseAdmin ?? supabase;

    const table = 'Asset';
    const { data, error } = await supabaseClient
      .from(table)
      .update(updateRow)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      if ((error as any).code === 'PGRST116') {
        return NextResponse.json({ error: `Asset with id ${id} not found` }, { status: 404 });
      }
      return NextResponse.json({ error: (error as any).message || 'Update failed' }, { status: 500 });
    }

    return NextResponse.json({ data: toAsset(data) }, { status: 200 });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Failed to update asset' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = request.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
    if (process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Prefer admin client for server-side deletes; fall back to anon
    const supabaseClient = supabaseAdmin ?? supabase;

    const table = 'Asset';
    const { data, error } = await supabaseClient
      .from(table)
      .delete()
      .eq('id', id)
      .select('id');

    if (error) {
      return NextResponse.json({ error: (error as any).message || 'Delete failed' }, { status: 500 });
    }

    const deleted = Array.isArray(data) && data.length > 0;
    if (!deleted) {
      return NextResponse.json({ error: `Asset with id ${id} not found` }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Failed to delete asset' },
      { status: 500 }
    );
  }
}