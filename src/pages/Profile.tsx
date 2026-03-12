import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useSavedLocations } from '@/hooks/useSavedLocations';
import { useSavedRecommendations } from '@/hooks/useSavedRecommendations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { User, Save, MapPin, Sparkles, BookOpen, Fish, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
}

function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<Profile | null> => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: { display_name?: string; avatar_url?: string }) => {
      if (!user) throw new Error('Not logged in');
      
      if (query.data) {
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('profiles')
          .insert({ user_id: user.id, ...updates });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return { profile: query.data, isLoading: query.isLoading, updateProfile };
}

function useFishingStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['fishing-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('fishing_logs')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;

      const totalTrips = data.length;
      const fishCaught = data.filter((l) => l.fish_caught).length;
      const fliesUsed = new Set(data.filter((l) => l.fly_used).map((l) => l.fly_used));
      const avgRating = data.filter((l) => l.success_rating)
        .reduce((acc, l) => acc + (l.success_rating || 0), 0) / (data.filter((l) => l.success_rating).length || 1);

      return { totalTrips, fishCaught, uniqueFlies: fliesUsed.size, avgRating: Math.round(avgRating * 10) / 10 };
    },
    enabled: !!user,
  });
}

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { profile, isLoading: profileLoading, updateProfile } = useProfile();
  const { savedLocations } = useSavedLocations();
  const { savedRecommendations } = useSavedRecommendations();
  const { data: stats, isLoading: statsLoading } = useFishingStats();

  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (!user) navigate('/auth');
  }, [user, navigate]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  if (!user) return null;

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        display_name: displayName || null,
        avatar_url: avatarUrl || null,
      });
      toast({ title: 'Profile updated!' });
    } catch {
      toast({ title: 'Error updating profile', variant: 'destructive' });
    }
  };

  const statCards = [
    { label: 'Total Trips', value: stats?.totalTrips || 0, icon: BookOpen, color: 'text-water' },
    { label: 'Fish Caught', value: stats?.fishCaught || 0, icon: Fish, color: 'text-forest' },
    { label: 'Flies Used', value: stats?.uniqueFlies || 0, icon: Sparkles, color: 'text-sunrise' },
    { label: 'Saved Spots', value: savedLocations.length, icon: MapPin, color: 'text-primary' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-8 flex items-center gap-2">
          <User className="h-8 w-8 text-primary" />
          My Profile
        </h1>

        {/* Profile Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Customize how you appear to other anglers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                  {displayName ? displayName[0].toUpperCase() : user.email?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{displayName || user.email?.split('@')[0]}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your fishing alias..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar-url">Avatar URL</Label>
              <Input
                id="avatar-url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <Button onClick={handleSave} disabled={updateProfile.isPending} className="gap-2">
              {updateProfile.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Fishing Stats</CardTitle>
            <CardDescription>Your fishing journey at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statCards.map((stat) => (
                <div key={stat.label} className="text-center p-4 bg-muted/30 rounded-lg">
                  <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                  <p className="text-2xl font-bold">{statsLoading ? '—' : stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
