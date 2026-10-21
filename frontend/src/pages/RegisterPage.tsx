import { authApi } from '@/api'
import { getErrorMessage } from '@/api/client'
import { useAuthStore } from '@/store/authStore'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Lock, Mail, User } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'

const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(2, 'Nama minimal 2 karakter')
      .max(100, 'Nama maksimal 100 karakter')
      .regex(/^[^0-9]+$/, 'Nama tidak boleh mengandung angka'),
    email: z.string().email('Format email tidak valid'),
    password: z
      .string()
      .min(8, 'Password minimal 8 karakter')
      .regex(/[A-Z]/, 'Password harus mengandung minimal 1 huruf kapital')
      .regex(/[a-z]/, 'Password harus mengandung minimal 1 huruf kecil')
      .regex(/[0-9]/, 'Password harus mengandung minimal 1 angka'),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Password tidak cocok',
    path: ['confirm_password'],
  })

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    setServerError(null)
    try {
      // 1. Register
      await authApi.register({
        email: data.email,
        full_name: data.full_name,
        password: data.password,
      })
      // 2. Auto-login setelah register berhasil
      const tokenRes = await authApi.login({
        email: data.email,
        password: data.password,
      })
      localStorage.setItem('fintrack_access_token', tokenRes.access_token)
      const user = await authApi.me()
      login(tokenRes.access_token, user)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setServerError(getErrorMessage(err))
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">💰 FinTrack</h1>
          <p className="text-muted-foreground mt-2">Buat akun baru</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

            {serverError && (
              <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-md">
                {serverError}
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-1">
              <label htmlFor="full_name" className="text-sm font-medium text-foreground">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="full_name"
                  type="text"
                  autoComplete="name"
                  placeholder="Budi Santoso"
                  className="w-full pl-9 pr-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  {...register('full_name')}
                />
              </div>
              {errors.full_name && (
                <p className="text-xs text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nama@email.com"
                  className="w-full pl-9 pr-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Min. 8 karakter"
                  className="w-full pl-9 pr-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label htmlFor="confirm_password" className="text-sm font-medium text-foreground">
                Konfirmasi Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="confirm_password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Ulangi password"
                  className="w-full pl-9 pr-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  {...register('confirm_password')}
                />
              </div>
              {errors.confirm_password && (
                <p className="text-xs text-destructive">{errors.confirm_password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Mendaftar...' : 'Daftar'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  )
}
