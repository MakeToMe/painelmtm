import { NextResponse } from 'next/server';
import { getAppDescription } from '@/lib/supabase/app-descriptions';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const description = await getAppDescription(params.slug);
    
    if (!description) {
      return new NextResponse('App description not found', { status: 404 });
    }

    return NextResponse.json(description);
  } catch (error) {
    console.error('Error in app description route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
