import { NextRequest, NextResponse } from 'next/server';

const COUNTRY_MAP: Record<string, string> = {
  'india':          'in',
  'uk':             'gb',
  'united kingdom': 'gb',
  'london':         'gb',
  'canada':         'ca',
  'australia':      'au',
  'germany':        'de',
  'france':         'fr',
  'singapore':      'sg',
  'uae':            'ae',
  'dubai':          'ae',
  'usa':            'us',
  'united states':  'us',
  'new york':       'us',
  'remote':         'gb',
};

function getCountryCode(location: string): string {
  if (!location) return 'us';
  const lower = location.toLowerCase().trim();
  for (const [key, code] of Object.entries(COUNTRY_MAP)) {
    if (lower.includes(key)) return code;
  }
  return 'us';
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query    = searchParams.get('query')    ?? '';
  const location = searchParams.get('location') ?? '';
  const jobType  = searchParams.get('jobType')  ?? '';
  const page     = searchParams.get('page')     ?? '1';

  const appId  = process.env.NEXT_PUBLIC_ADZUNA_APP_ID;
  const appKey = process.env.NEXT_PUBLIC_ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    return NextResponse.json({ error: 'API keys missing' }, { status: 500 });
  }

  if (!query.trim()) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  const params = new URLSearchParams({
    app_id:           appId,
    app_key:          appKey,
    results_per_page: '10',
    what:             query,
  });

  if (location) params.append('where', location);
  if (jobType === 'Full-time') params.append('full_time', '1');
  if (jobType === 'Part-time') params.append('part_time', '1');
  if (jobType === 'Contract')  params.append('contract',  '1');

  const countryCode = getCountryCode(location);

  try {
    const res = await fetch(
      `https://api.adzuna.com/v1/api/jobs/${countryCode}/search/${page}?${params}`,
      { headers: { 'Accept': 'application/json' } }
    );

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error('[jobs/search] Non-JSON response:', text.slice(0, 200));
      return NextResponse.json({ error: 'Invalid response from Adzuna' }, { status: 500 });
    }

    if (!res.ok) {
      console.error('[jobs/search] Adzuna error:', data);
      return NextResponse.json({ error: data?.error ?? 'Adzuna API error' }, { status: res.status });
    }

    return NextResponse.json({
      results: data.results ?? [],
      total:   data.count   ?? 0,
      page:    parseInt(page),
    });

  } catch (err) {
    console.error('[jobs/search] fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}