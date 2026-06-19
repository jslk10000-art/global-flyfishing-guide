import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface RequestBody {
  lake?: string;
  weather?: string;
  season?: string;
  targetFish?: string;
  waterTemp?: number;
  airTemperature?: number;
  latitude?: number;
  longitude?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: authError } = await supabaseClient.auth.getClaims(token);
    if (authError || !claims?.claims) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Authenticated user:', claims.claims.sub);

    const body: RequestBody = await req.json();
    const { lake, weather, season, targetFish, waterTemp, latitude, longitude } = body;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const currentMonth = new Date().getMonth();
    const currentSeason = season || getSeasonFromMonth(currentMonth, latitude);
    
    // Estimate water temperature based on air temp, season, and latitude
    const estimatedWaterTemp = waterTemp || estimateWaterTemperature(
      body.airTemperature,
      currentSeason,
      latitude
    );

    const prompt = `You are an expert fly fishing guide with worldwide knowledge. Based on the following conditions, recommend 6-8 DIVERSE flies that would be most effective. Provide real variety: include a mix across categories (at least one dry fly, one nymph, one streamer, one emerger, and one terrestrial when seasonally appropriate), vary sizes/colors, and include both classic proven patterns AND a couple of less obvious or region-specific patterns that match the local hatches, baitfish, or food sources. Avoid repeating similar patterns.

Location: ${lake || 'Unknown location'}
Coordinates: ${latitude && longitude ? `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°` : 'Unknown'}
Weather: ${weather || 'Unknown'}
Season: ${currentSeason}
Target Fish: ${targetFish || 'Local trout or game fish'}
Water Temperature: ${estimatedWaterTemp ? `${estimatedWaterTemp}°C` : 'Unknown'}

Consider the local fish species, typical hatches for this region and season, and current weather conditions.

For each fly, provide:
1. Name (common fly name that works internationally)
2. Type (dry fly, nymph, streamer, emerger, or terrestrial)
3. A brief reason why it's effective in these conditions
4. Confidence level (high, medium, or low)
5. Line type recommendation (floating, intermediate, slow sinking, fast sinking, or sinking tip)
6. Leader length advice (e.g., "9ft 5X", "7ft 3X", "12ft 6X")
7. Retrieve style (e.g., "dead drift", "slow strips", "fast erratic strips", "figure-eight", "swing and hang")
8. Ideal depth to fish (e.g., "surface film", "1-3 feet", "mid-column 4-8 feet", "deep 10+ feet", "bottom")

Respond in JSON format with an array of recommendations:
[
  {
    "name": "Fly Name",
    "type": "dry fly",
    "reason": "Brief explanation",
    "confidence": "high",
    "lineType": "floating",
    "leaderLength": "9ft 5X",
    "retrieveStyle": "dead drift with occasional twitch",
    "idealDepth": "surface film"
  }
]

Only return the JSON array, nothing else.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert fly fishing guide with worldwide knowledge of fish species, hatches, and effective fly patterns. Always respond with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.95,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '[]';
    
    // Parse the JSON response, handling potential markdown code blocks
    let recommendations;
    try {
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      recommendations = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      // Return fallback recommendations
      recommendations = getDefaultRecommendations(currentSeason);
    }

    return new Response(JSON.stringify({ 
      recommendations,
      estimatedWaterTemp,
      season: currentSeason
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fly-recommendations:', error);
    
    // Return fallback recommendations on error
    const fallback = getDefaultRecommendations('summer');
    return new Response(JSON.stringify({ 
      recommendations: fallback,
      fallback: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getSeasonFromMonth(month: number, latitude?: number): string {
  // Southern hemisphere has reversed seasons
  const isSouthernHemisphere = latitude !== undefined && latitude < 0;
  
  if (isSouthernHemisphere) {
    if (month >= 2 && month <= 4) return 'fall';
    if (month >= 5 && month <= 7) return 'winter';
    if (month >= 8 && month <= 10) return 'spring';
    return 'summer';
  }
  
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

interface FlyRecommendation {
  name: string;
  type: string;
  reason: string;
  confidence: string;
  lineType?: string;
  leaderLength?: string;
  retrieveStyle?: string;
  idealDepth?: string;
}

// Estimate water temperature based on air temp, season, and latitude
function estimateWaterTemperature(
  airTemp?: number,
  season?: string,
  latitude?: number
): number | null {
  if (!airTemp) return null;
  
  // Water temperature typically lags behind air temperature
  // and is moderated by thermal mass
  let waterTemp = airTemp;
  
  // Seasonal adjustment - water is cooler in spring (warming), warmer in fall (cooling)
  const seasonalAdjustment: Record<string, number> = {
    spring: -4, // Water still cold from winter
    summer: -2, // Water catches up but stays slightly cooler
    fall: 2,    // Water retains summer warmth
    winter: 2,  // Water retains fall warmth (above freezing)
  };
  
  if (season) {
    waterTemp += seasonalAdjustment[season] || 0;
  }
  
  // Latitude adjustment - higher latitudes have colder water
  if (latitude !== undefined) {
    const latAdjustment = Math.abs(latitude) > 50 ? -3 : 
                          Math.abs(latitude) > 40 ? -1 : 0;
    waterTemp += latAdjustment;
  }
  
  // Water temp typically ranges between 0-25°C for most fishing waters
  waterTemp = Math.max(0, Math.min(25, waterTemp));
  
  return Math.round(waterTemp);
}

function getDefaultRecommendations(season: string): FlyRecommendation[] {
  const seasonalFlies: Record<string, FlyRecommendation[]> = {
    spring: [
      { name: 'Blue Winged Olive', type: 'dry fly', reason: 'BWOs hatch heavily in spring during overcast days', confidence: 'high', lineType: 'floating', leaderLength: '9ft 5X', retrieveStyle: 'dead drift', idealDepth: 'surface film' },
      { name: 'RS2', type: 'emerger', reason: 'Excellent emerger pattern for spring mayfly hatches', confidence: 'high', lineType: 'floating', leaderLength: '10ft 5X', retrieveStyle: 'dead drift with occasional lift', idealDepth: '1-2 feet' },
      { name: 'San Juan Worm', type: 'nymph', reason: 'Effective year-round, especially during runoff', confidence: 'medium', lineType: 'floating with indicator', leaderLength: '7ft 4X', retrieveStyle: 'dead drift near bottom', idealDepth: 'bottom' },
    ],
    summer: [
      { name: 'Elk Hair Caddis', type: 'dry fly', reason: 'Classic summer pattern matching prolific caddis hatches', confidence: 'high', lineType: 'floating', leaderLength: '9ft 5X', retrieveStyle: 'dead drift or skate', idealDepth: 'surface' },
      { name: 'Hopper', type: 'terrestrial', reason: 'Grasshoppers are abundant near meadows in summer', confidence: 'high', lineType: 'floating', leaderLength: '7ft 3X', retrieveStyle: 'splat cast then dead drift', idealDepth: 'surface' },
      { name: 'Pheasant Tail Nymph', type: 'nymph', reason: 'Versatile pattern that imitates many mayfly nymphs', confidence: 'medium', lineType: 'floating with indicator', leaderLength: '9ft 5X', retrieveStyle: 'dead drift', idealDepth: '2-4 feet' },
    ],
    fall: [
      { name: 'October Caddis', type: 'dry fly', reason: 'Large caddis hatches occur in fall evenings', confidence: 'high', lineType: 'floating', leaderLength: '9ft 4X', retrieveStyle: 'dead drift or swing', idealDepth: 'surface' },
      { name: 'Woolly Bugger', type: 'streamer', reason: 'Trout feed aggressively before winter', confidence: 'high', lineType: 'intermediate or sinking tip', leaderLength: '5ft 3X', retrieveStyle: 'slow strips with pauses', idealDepth: '4-8 feet' },
      { name: 'Baetis', type: 'dry fly', reason: 'Small mayflies hatch on cloudy fall days', confidence: 'medium', lineType: 'floating', leaderLength: '12ft 6X', retrieveStyle: 'dead drift', idealDepth: 'surface film' },
    ],
    winter: [
      { name: 'Midge', type: 'dry fly', reason: 'Midges are the primary winter food source', confidence: 'high', lineType: 'floating', leaderLength: '12ft 6X', retrieveStyle: 'dead drift', idealDepth: 'surface film' },
      { name: 'Zebra Midge', type: 'nymph', reason: 'Deadly subsurface pattern in cold water', confidence: 'high', lineType: 'floating with indicator', leaderLength: '9ft 5X', retrieveStyle: 'dead drift very slow', idealDepth: '1-4 feet' },
      { name: 'Egg Pattern', type: 'nymph', reason: 'Imitates fish eggs during spawning season', confidence: 'medium', lineType: 'floating with indicator', leaderLength: '7ft 4X', retrieveStyle: 'dead drift near bottom', idealDepth: 'bottom' },
    ],
  };

  return seasonalFlies[season] || seasonalFlies.summer;
}
