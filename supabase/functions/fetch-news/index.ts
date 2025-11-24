import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface RequestBody {
  keywords: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { keywords }: RequestBody = await req.json();

    if (!keywords || keywords.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Keywords are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: settings } = await supabase
      .from('user_settings')
      .select('news_api_key')
      .maybeSingle();

    const newsApiKey = settings?.news_api_key || Deno.env.get('NEWS_API_KEY');

    if (!newsApiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'NewsAPI key not configured. Please add it in Settings.',
          hint: 'Get a free API key at https://newsapi.org/register'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const query = keywords.join(' OR ');
    const newsApiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=50&language=en&apiKey=${newsApiKey}`;

    const newsResponse = await fetch(newsApiUrl);
    const newsData = await newsResponse.json();

    if (newsData.status !== 'ok') {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch news',
          details: newsData.message || 'Unknown error'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const articles = newsData.articles || [];
    const articlesToInsert = articles.map((article: any) => {
      const matchedKeywords = keywords.filter(keyword =>
        article.title?.toLowerCase().includes(keyword.toLowerCase()) ||
        article.description?.toLowerCase().includes(keyword.toLowerCase())
      );

      return {
        title: article.title || 'Untitled',
        description: article.description,
        url: article.url,
        image_url: article.urlToImage,
        source: article.source?.name || 'Unknown',
        published_at: article.publishedAt,
        keywords: matchedKeywords.length > 0 ? matchedKeywords : keywords,
      };
    });

    const validArticles = articlesToInsert.filter(
      (article: any) => article.url && article.published_at
    );

    if (validArticles.length > 0) {
      for (const article of validArticles) {
        await supabase
          .from('cached_articles')
          .upsert(article, { onConflict: 'url', ignoreDuplicates: true });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        cached: validArticles.length,
        message: `Cached ${validArticles.length} articles`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in fetch-news function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});