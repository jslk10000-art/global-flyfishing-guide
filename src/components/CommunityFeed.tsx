import { useState } from 'react';
import { useCommunityPosts, useCreatePost, useDeletePost } from '@/hooks/useCommunity';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PhotoUpload } from './PhotoUpload';
import { CommunityComments } from './CommunityComments';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Trash2, Plus, Fish, MapPin, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function CommunityFeed() {
  const { data: posts, isLoading } = useCommunityPosts();
  const createPost = useCreatePost();
  const deletePost = useDeletePost();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [locationName, setLocationName] = useState('');
  const [fishSpecies, setFishSpecies] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createPost.mutateAsync({
        title: title.trim(),
        content: content.trim() || undefined,
        photo_url: photoUrl || undefined,
        location_name: locationName.trim() || undefined,
        fish_species: fishSpecies.trim() || undefined,
      });
      toast({ title: 'Post shared!' });
      setTitle('');
      setContent('');
      setPhotoUrl('');
      setLocationName('');
      setFishSpecies('');
      setShowForm(false);
    } catch {
      toast({ title: 'Failed to create post', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePost.mutateAsync(id);
      toast({ title: 'Post deleted' });
    } catch {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {user && (
        <div>
          {!showForm ? (
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Share a Catch
            </Button>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Share Your Catch</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      placeholder="e.g., Great day on the river!"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        placeholder="e.g., River Dee"
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fish Species</Label>
                      <Input
                        placeholder="e.g., Brown Trout"
                        value={fishSpecies}
                        onChange={(e) => setFishSpecies(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Details</Label>
                    <Textarea
                      placeholder="Tell us about your trip..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <PhotoUpload
                    onPhotoUploaded={setPhotoUrl}
                    onRemove={() => setPhotoUrl('')}
                  />
                  <div className="flex gap-2">
                    <Button type="submit" disabled={createPost.isPending}>
                      {createPost.isPending ? 'Posting...' : 'Post'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      )}

      {posts && posts.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Fish className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No posts yet. Be the first to share a catch!</p>
          </CardContent>
        </Card>
      )}

      {posts?.map((post) => (
        <Card key={post.id} className="group">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{post.title}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </p>
              </div>
              {user?.id === post.user_id && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                  onClick={() => handleDelete(post.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>

            {post.photo_url && (
              <div className="rounded-lg overflow-hidden border">
                <img src={post.photo_url} alt={post.title} className="w-full h-64 object-cover" />
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {post.fish_species && (
                <Badge variant="secondary">
                  <Fish className="h-3 w-3 mr-1" />
                  {post.fish_species}
                </Badge>
              )}
              {post.location_name && (
                <Badge variant="outline">
                  <MapPin className="h-3 w-3 mr-1" />
                  {post.location_name}
                </Badge>
              )}
            </div>

            {post.content && <p className="text-sm">{post.content}</p>}

            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-muted-foreground"
              onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
            >
              <MessageSquare className="h-4 w-4" />
              {post.comment_count || 0} Comments
            </Button>

            {expandedPost === post.id && <CommunityComments postId={post.id} />}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
