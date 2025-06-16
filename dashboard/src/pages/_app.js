import { AuthProvider } from '../components/Auth/AuthProvider';
import { useAuth } from '../components/Auth/AuthProvider';
import Dashboard from '../components/Dashboard';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import '../styles/globals.css';

function AuthenticatedApp({ Component, pageProps }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated && router.pathname !== '/login') {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated && router.pathname !== '/login') {
    return null;
  }

  return <Component {...pageProps} />;
}

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <AuthenticatedApp Component={Component} pageProps={pageProps} />
    </AuthProvider>
  );
}

export default MyApp;