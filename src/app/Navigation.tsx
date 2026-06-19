
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { useTheme } from './ThemeProvider';
import { auth } from '../lib/firebase';

const Navigation = () => {
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    auth.signOut().then(() => {
      // Redirect to login page after logout
      router.push('/auth');
    });
  };

  // Extract username from email or use displayName
  const getUserDisplayName = () => {
    if (user?.displayName) {
      return user.displayName;
    }
    if (user?.email) {
      // Extract username from email (part before @)
      return user.email.split('@')[0];
    }
    return 'User';
  };

  // Check if the current path matches the link
  const isActiveLink = (path: string) => {
    return pathname === path;
  };

  // Get link classes with active state
  const getLinkClasses = (path: string) => {
    const baseClasses = "hover:text-purple-400 transition-colors";
    const isActive = isActiveLink(path);
    
    if (isActive) {
      return `${baseClasses} text-purple-400 font-semibold`;
    }
    
    return `${baseClasses} ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`;
  };

  return (
    <nav className={`fixed top-0 w-full z-50 ${theme === 'dark' ? 'dark-glass' : 'glass-effect'}`} id="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">🧠</span>
            </div>
            <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} id="logo-text">MindMate</span>
          </div>
          
          <div className="flex items-center space-x-6" id="nav-menu">
            {!user && (
              <>
                <Link href="/" className={getLinkClasses('/')}>Home</Link>
                <Link href="/features" className={getLinkClasses('/features')}>Features</Link>
              </>
            )}
            {user && (
              <>
                <Link href="/dashboard" className={getLinkClasses('/dashboard')}>Dashboard</Link>
                <Link href="/chat" className={getLinkClasses('/chat')}>Chat</Link>
                <Link href="/activities" className={getLinkClasses('/activities')}>Activities</Link>
                <Link href="/exercise" className={getLinkClasses('/exercise')}>Mindful Exercises</Link>
              </>
            )}
            
            <button onClick={toggleTheme} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-200 text-gray-900'}`} id="theme-toggle">
              <span id="theme-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
            </button>
            
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-purple-400">Welcome, {getUserDisplayName()}!</span>
                    <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition-all">
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link href="/auth" id="get-started-btn" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all">
                    Get Started
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
