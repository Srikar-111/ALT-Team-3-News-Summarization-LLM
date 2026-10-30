import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawUrl = (body.url || '').trim();

    if (!rawUrl) {
      return NextResponse.json(
        { detail: 'Please enter a valid news article URL.' },
        { status: 400 }
      );
    }

    let url = rawUrl;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { detail: `Invalid URL format: '${rawUrl}'. Please include domain (e.g. https://www.bbc.com/news/...)` },
        { status: 400 }
      );
    }

    const domain = parsedUrl.hostname.replace('www.', '');
    const path = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');

    // Check if the user pasted a homepage instead of a specific news story
    if (!path || ['index.html', 'index.php', 'home', 'en', 'news'].includes(path)) {
      return NextResponse.json(
        {
          detail: `You entered the homepage of ${domain} instead of an article story. Please click on a specific news story (e.g. ${domain}/news/...) and paste that article link.`,
        },
        { status: 400 }
      );
    }

    // Attempt 1: Forward to local FastAPI backend on 127.0.0.1:8000
    try {
      const backendRes = await fetch('http://127.0.0.1:8000/api/extract-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
        signal: AbortSignal.timeout(15000),
      });

      const data = await backendRes.json();
      return NextResponse.json(data, { status: backendRes.status });
    } catch (backendErr) {
      // If FastAPI is unavailable, extract directly via fetch
      console.warn('FastAPI backend not reachable for URL extraction, falling back to direct fetch:', backendErr);
    }

    // Attempt 2: Direct extraction in Node.js
    const pageRes = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!pageRes.ok) {
      return NextResponse.json(
        {
          detail: `Failed to fetch page (HTTP ${pageRes.status}). ${domain} may be blocking scrapers or require a subscription.`,
        },
        { status: 400 }
      );
    }

    const html = await pageRes.text();

    // Extract title
    let title = '';
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
    if (ogTitleMatch) {
      title = ogTitleMatch[1];
    } else {
      const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      if (h1Match) {
        title = h1Match[1].replace(/<[^>]+>/g, '').trim();
      } else {
        const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        if (titleMatch) title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
      }
    }

    // Clean HTML: strip scripts, styles, navs
    const cleanHtml = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '');

    // Extract paragraph texts
    const pMatches = cleanHtml.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi);
    const paragraphs: string[] = [];
    for (const match of pMatches) {
      const text = match[1]
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
      if (text.length > 50 && !text.toLowerCase().includes('subscription') && !text.toLowerCase().includes('cookie')) {
        paragraphs.push(text);
      }
    }

    const articleText = paragraphs.join('\n\n');
    const wordCount = articleText.split(/\s+/).filter(Boolean).length;

    if (wordCount < 40) {
      return NextResponse.json(
        {
          detail: `Could not extract enough readable article text from this page (${wordCount} words found). ${domain} may require a paid subscription or have protected dynamic content. Try copying and pasting the text directly into the "Paste Text" tab.`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      url,
      title: title || 'Extracted News Article',
      text: articleText,
      description: '',
      word_count: wordCount,
    });
  } catch (err: any) {
    return NextResponse.json(
      { detail: `Extraction error: ${err.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
