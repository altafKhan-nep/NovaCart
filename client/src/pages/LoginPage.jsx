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
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary-container/20 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary-container/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#a43c12] to-[#ff7f50] flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              local_mall
            </span>
          </div>
          <span className="text-xl font-bold text-on-surface tracking-tight">NovaCart</span>
        </Link>

        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-[0_8px_40px_rgba(164,60,18,0.06)] border border-surface-container/40">
          <div className="text-center mb-7">
            <h1 className="text-2xl font-bold text-on-surface mb-1.5">Welcome back</h1>
            <p className="text-sm text-on-surface-variant/70">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px] pointer-events-none">
                  mail
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: '' })); }}
                  className={`w-full pl-11 pr-4 py-3 bg-surface-container-low border rounded-xl text-sm text-on-surface outline-none transition-all placeholder:text-on-surface-variant/40 ${errors.email ? 'border-error/60 focus:border-error focus:ring-2 focus:ring-error/10' : 'border-surface-container hover:border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/10'}`}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-xs text-error mt-1.5 font-medium">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px] pointer-events-none">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: '' })); }}
                  className={`w-full pl-11 pr-11 py-3 bg-surface-container-low border rounded-xl text-sm text-on-surface outline-none transition-all placeholder:text-on-surface-variant/40 ${errors.password ? 'border-error/60 focus:border-error focus:ring-2 focus:ring-error/10' : 'border-surface-container hover:border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/10'}`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant/50 hover:text-primary transition-colors rounded-lg"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {errors.password && <p className="text-xs text-error mt-1.5 font-medium">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-4 h-4 rounded border border-surface-container-high bg-surface-container-low peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                    {rememberMe && (
                      <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    )}
                  </div>
                </div>
                <span className="text-sm text-on-surface-variant">Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-primary/90 text-on-primary font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-sm disabled:opacity-60 hover:shadow-[0_8px_25px_-5px_rgba(164,60,18,0.4)] transition-all duration-200 active:scale-[0.98]"
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

          <p className="text-center text-sm text-on-surface-variant mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>

        <div className="mt-4 p-4 bg-surface-container-lowest/60 rounded-xl border border-surface-container/40">
          <p className="text-[11px] font-bold text-on-surface-variant/50 mb-2 uppercase tracking-wider">Demo accounts</p>
          <div className="space-y-1.5">
            <p className="text-xs text-on-surface-variant/70">
              Admin: <span className="font-semibold text-on-surface-variant">admin@novacart.com</span> / <span className="font-semibold text-on-surface-variant">password123</span>
            </p>
            <p className="text-xs text-on-surface-variant/70">
              Customer: <span className="font-semibold text-on-surface-variant">alex@novacart.com</span> / <span className="font-semibold text-on-surface-variant">password123</span>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
