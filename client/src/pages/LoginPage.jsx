import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { validateEmail } from '../utils/security';
import LoadingSpinner from '../components/LoadingSpinner';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (user) navigate(user.isAdmin ? '/admin' : '/');
  }, [user, navigate]);

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!validateEmail(email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success('Welcome back!');
      navigate(data?.isAdmin ? '/admin' : '/');
    } catch (err) {
      toast.error(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden bg-background">
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary-container/20 rounded-full blur-3xl animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary-container/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
          <span className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center group-hover:animate-wiggle transition-transform">
            <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
              local_mall
            </span>
          </span>
          <span className="text-xl font-bold text-primary">NovaCart</span>
        </Link>

        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_8px_30px_rgba(164,60,18,0.06)] border border-surface-container/60">
          <h1 className="text-xl font-bold text-on-surface mb-1">Welcome back!</h1>
          <p className="text-sm text-on-surface-variant mb-6">Sign in to continue your joyful journey.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none">
                  mail
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: '' })); }}
                  className={`w-full pl-10 pr-4 py-2.5 bg-surface-container-low border rounded-lg text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary-container/20 transition-all ${errors.email ? 'border-error' : 'border-surface-container focus:border-primary-container'}`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="text-xs text-error mt-1.5 font-medium">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: '' })); }}
                  className={`w-full pl-10 pr-10 py-2.5 bg-surface-container-low border rounded-lg text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary-container/20 transition-all ${errors.password ? 'border-error' : 'border-surface-container focus:border-primary-container'}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {errors.password && <p className="text-xs text-error mt-1.5 font-medium">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-surface-container text-primary focus:ring-primary-container accent-primary cursor-pointer"
                />
                <span className="text-sm text-on-surface-variant">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm font-semibold text-primary hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-on-primary-container font-semibold py-3 rounded-lg flex items-center justify-center gap-2 text-sm disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Signing in...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">login</span>
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-container"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface-container-lowest px-3 text-on-surface-variant font-medium">or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-surface-container bg-surface-container-low text-sm font-semibold text-on-surface hover:bg-surface-container-high transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-surface-container bg-surface-container-low text-sm font-semibold text-on-surface hover:bg-surface-container-high transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Apple
            </button>
          </div>

          <p className="text-center text-sm text-on-surface-variant mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Create one
            </Link>
          </p>

          <div className="mt-5 pt-5 border-t border-surface-container bg-surface-container-low rounded-lg p-4">
            <p className="text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Demo accounts</p>
            <div className="space-y-1">
              <p className="text-xs text-on-surface-variant">
                Admin: <span className="font-semibold">admin@novacart.com</span> / <span className="font-semibold">password123</span>
              </p>
              <p className="text-xs text-on-surface-variant">
                User: <span className="font-semibold">alex@novacart.com</span> / <span className="font-semibold">password123</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
