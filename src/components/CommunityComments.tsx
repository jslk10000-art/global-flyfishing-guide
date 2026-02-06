import { useState } from 'react';
import { usePostComments, useCreateComment } from '@/hooks/useCommunity';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Send, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommunityCommentsProps {
  postId: string;
}

export function CommunityComments({ postId }: CommunityCommentsProps) {
  const { data: comments, isLoading } = usePostComments(postId);
  const createComment = useCreateComment();
  const { user } = useAuth();
  const { toast } = useToast();
  const [text, setText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await createComment.mutateAsync({ post_id: postId, content: text.trim() });
      setText('');
    } catch {
      toast({ title: 'Failed to add comment', variant: 'destructive' });
    }
  };

  return (
    <div className="border-t pt-3 space-y-3">
      {isLoading && <Skeleton className="h-12 w-full" />}

      {comments?.map((comment) => (
        <div key={comment.id} className="flex gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted shrink-0">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm">{comment.content}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}

      {user && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Add a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="text-sm"
          />
          <Button type="submit" size="icon" disabled={createComment.isPending || !text.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      )}
    </div>
  );
}
