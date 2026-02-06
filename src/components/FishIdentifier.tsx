import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { Camera, Search, Loader2, Fish, MapPin, Ruler, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FishResult {
  species?: string;
  scientificName?: string;
  confidence?: string;
  description?: string;
  habitat?: string;
  averageSize?: string;
  bestFlies?: string[];
  bestSeason?: string;
  regulations?: string;
  funFact?: string;
  answer?: string;
}

export function FishIdentifier() {
  const [result, setResult] = useState<FishResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const { fileToBase64 } = usePhotoUpload();
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const identify = async (imageBase64?: string) => {
    if (!imageBase64 && !question.trim()) {
      toast({ title: 'Please provide a photo or question', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('identify-fish', {
        body: { imageBase64, question: question.trim() || undefined },
      });

      if (error) throw error;
      setResult(data);
    } catch (err) {
      toast({ title: 'Failed to identify fish', description: String(err), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const base64 = await fileToBase64(file);
    setPreview(base64);
    identify(base64);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Fish Identifier
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload a photo to identify a fish species, or ask a question about fish.
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => inputRef.current?.click()}
              disabled={loading}
            >
              <Camera className="h-4 w-4" />
              Upload Photo
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
          </div>

          {preview && (
            <div className="rounded-lg overflow-hidden border">
              <img src={preview} alt="Fish to identify" className="w-full h-48 object-cover" />
            </div>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="Ask about a fish species..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && identify(preview || undefined)}
            />
            <Button onClick={() => identify(preview || undefined)} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Analyzing...</span>
          </CardContent>
        </Card>
      )}

      {result && !result.answer && result.species && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Fish className="h-5 w-5 text-primary" />
                  {result.species}
                </CardTitle>
                {result.scientificName && (
                  <p className="text-sm text-muted-foreground italic">{result.scientificName}</p>
                )}
              </div>
              {result.confidence && (
                <Badge variant={result.confidence === 'high' ? 'default' : 'secondary'}>
                  {result.confidence} confidence
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.description && <p className="text-sm">{result.description}</p>}

            <div className="grid gap-3 sm:grid-cols-2">
              {result.habitat && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Habitat</p>
                    <p className="text-sm">{result.habitat}</p>
                  </div>
                </div>
              )}
              {result.averageSize && (
                <div className="flex items-start gap-2">
                  <Ruler className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Average Size</p>
                    <p className="text-sm">{result.averageSize}</p>
                  </div>
                </div>
              )}
              {result.bestSeason && (
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Best Season</p>
                    <p className="text-sm">{result.bestSeason}</p>
                  </div>
                </div>
              )}
            </div>

            {result.bestFlies && result.bestFlies.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Best Flies</p>
                <div className="flex flex-wrap gap-1">
                  {result.bestFlies.map((fly, i) => (
                    <Badge key={i} variant="outline">{fly}</Badge>
                  ))}
                </div>
              </div>
            )}

            {result.regulations && (
              <div className="rounded-md bg-muted p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Regulations Note</p>
                <p className="text-sm">{result.regulations}</p>
              </div>
            )}

            {result.funFact && (
              <div className="rounded-md bg-primary/5 p-3">
                <p className="text-xs font-medium text-primary mb-1">Fun Fact</p>
                <p className="text-sm">{result.funFact}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {result?.answer && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm whitespace-pre-wrap">{result.answer}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
