// app/api/geocode/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: "Geocoding API works!" }, { status: 200 });
}