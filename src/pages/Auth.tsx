import { AuthForm } from '@/components/AuthForm';
import { Header } from '@/components/Header';

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AuthForm />
    </div>
  );
}
