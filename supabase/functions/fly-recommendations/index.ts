const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  lake?: string;
  weather?: string;
  season?: string;
  targetFish?: string;
  waterTemp?: number;
  latitude?: number;
  longitude?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const { lake, weather, season, targetFish, waterTemp, latitude, longitude } = body;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const currentMonth = new Date().getMonth();
    const currentSeason = season || getSeasonFromMonth(currentMonth, latitude);

    const prompt = `You are an expert fly fishing guide with worldwide knowledge. Based on the following conditions, recommend 3-5 flies that would be most effective:

Location: ${lake || 'Unknown location'}
Coordinates: ${latitude && longitude ? `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°` : 'Unknown'}
Weather: ${weather || 'Unknown'}
Season: ${currentSeason}
Target Fish: ${targetFish || 'Local trout or game fish'}
Water Temperature: ${waterTemp ? `${waterTemp}°` : 'Unknown'}

Consider the local fish species, typical hatches for this region and season, and current weather conditions.

For each fly, provide:
1. Name (common fly name that works internationally)
2. Type (dry fly, nymph, streamer, emerger, or terrestrial)
3. A brief reason why it's effective in these conditions
4. Confidence level (high, medium, or low)

Respond in JSON format with an array of recommendations:
[
  {
    "name": "Fly Name",
    "type": "dry fly",
    "reason": "Brief explanation",
    "confidence": "high"
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
        temperature: 0.7,
        max_tokens: 1000,
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

    return new Response(JSON.stringify({ recommendations }), {
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
}

function getDefaultRecommendations(season: string): FlyRecommendation[] {
  const seasonalFlies: Record<string, FlyRecommendation[]> = {
    spring: [
      { name: 'Blue Winged Olive', type: 'dry fly', reason: 'BWOs hatch heavily in spring during overcast days', confidence: 'high' },
      { name: 'RS2', type: 'emerger', reason: 'Excellent emerger pattern for spring mayfly hatches', confidence: 'high' },
      { name: 'San Juan Worm', type: 'nymph', reason: 'Effective year-round, especially during runoff', confidence: 'medium' },
    ],
    summer: [
      { name: 'Elk Hair Caddis', type: 'dry fly', reason: 'Classic summer pattern matching prolific caddis hatches', confidence: 'high' },
      { name: 'Hopper', type: 'terrestrial', reason: 'Grasshoppers are abundant near meadows in summer', confidence: 'high' },
      { name: 'Pheasant Tail Nymph', type: 'nymph', reason: 'Versatile pattern that imitates many mayfly nymphs', confidence: 'medium' },
    ],
    fall: [
      { name: 'October Caddis', type: 'dry fly', reason: 'Large caddis hatches occur in fall evenings', confidence: 'high' },
      { name: 'Woolly Bugger', type: 'streamer', reason: 'Trout feed aggressively before winter', confidence: 'high' },
      { name: 'Baetis', type: 'dry fly', reason: 'Small mayflies hatch on cloudy fall days', confidence: 'medium' },
    ],
    winter: [
      { name: 'Midge', type: 'dry fly', reason: 'Midges are the primary winter food source', confidence: 'high' },
      { name: 'Zebra Midge', type: 'nymph', reason: 'Deadly subsurface pattern in cold water', confidence: 'high' },
      { name: 'Egg Pattern', type: 'nymph', reason: 'Imitates fish eggs during spawning season', confidence: 'medium' },
    ],
  };

  return seasonalFlies[season] || seasonalFlies.summer;
}
