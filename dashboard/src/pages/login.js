import LoginForm from '../components/Auth/LoginForm';
import { useAuth } from '../components/Auth/AuthProvider';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Login() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleLoginSuccess = () => {
    router.push('/');
  };

  return <LoginForm onLoginSuccess={handleLoginSuccess} />;
}