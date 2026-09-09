import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { validateEmail, validatePassword } from '../utils/security';
import LoadingSpinner from '../components/LoadingSpinner';

const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return { label: 'Weak', color: 'bg-error', width: 'w-1/3', textColor: 'text-error' };
  if (score <= 4) return { label: 'Medium', color: 'bg-tertiary-container', width: 'w-2/3', textColor: 'text-tertiary' };
  return { label: 'Strong', color: 'bg-secondary', width: 'w-full', textColor: 'text-secondary' };
};

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const validate = () => {
    const errs = {};
    if (!name.trim()) {
      errs.name = 'Name is required';
    } else if (name.trim().length < 2 || name.trim().length > 50) {
      errs.name = 'Name must be 2-50 characters';
    }
    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!validateEmail(email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    } else {
      const { valid, errors: pwErrors } = validatePassword(password);
      if (!valid) errs.password = pwErrors.join('. ');
    }
    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    if (!agreeTerms) {
      errs.terms = 'You must agree to the Terms of Service';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden bg-background">
      <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-container/20 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-container/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }} />

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
            <h1 className="text-2xl font-bold text-on-surface mb-1.5">Create Account</h1>
            <p className="text-sm text-on-surface-variant/70">Join NovaCart and start shopping</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Full Name</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px] pointer-events-none">
                  person
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: '' })); }}
                  className={`w-full pl-11 pr-4 py-3 bg-surface-container-low border rounded-xl text-sm text-on-surface outline-none transition-all placeholder:text-on-surface-variant/40 ${errors.name ? 'border-error/60 focus:border-error focus:ring-2 focus:ring-error/10' : 'border-surface-container hover:border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/10'}`}
                  placeholder="Jane Doe"
                  autoComplete="name"
                />
              </div>
              {errors.name && <p className="text-xs text-error mt-1.5 font-medium">{errors.name}</p>}
            </div>

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
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant/50 hover:text-primary transition-colors rounded-lg"
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {errors.password && <p className="text-xs text-error mt-1.5 font-medium">{errors.password}</p>}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-on-surface-variant/60">Password strength</span>
                    <span className={`text-xs font-semibold ${strength.textColor}`}>{strength.label}</span>
                  </div>
                  <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Confirm Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[20px] pointer-events-none">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: '' })); }}
                  className={`w-full pl-11 pr-4 py-3 bg-surface-container-low border rounded-xl text-sm text-on-surface outline-none transition-all placeholder:text-on-surface-variant/40 ${errors.confirmPassword ? 'border-error/60 focus:border-error focus:ring-2 focus:ring-error/10' : 'border-surface-container hover:border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/10'}`}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-error mt-1.5 font-medium">{errors.confirmPassword}</p>}
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => { setAgreeTerms(e.target.checked); if (errors.terms) setErrors((p) => ({ ...p, terms: '' })); }}
                    className="peer sr-only"
                  />
                  <div className="w-4 h-4 rounded border border-surface-container-high bg-surface-container-low peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                    {agreeTerms && (
                      <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    )}
                  </div>
                </div>
                <span className="text-sm text-on-surface-variant leading-snug">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary font-semibold hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-primary font-semibold hover:underline">Privacy Policy</Link>
                </span>
              </label>
              {errors.terms && <p className="text-xs text-error mt-1.5 font-medium">{errors.terms}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-primary/90 text-on-primary font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-sm disabled:opacity-60 hover:shadow-[0_8px_25px_-5px_rgba(164,60,18,0.4)] transition-all duration-200 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Creating account...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">person_add</span>
                  Create Account
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default RegisterPage;
