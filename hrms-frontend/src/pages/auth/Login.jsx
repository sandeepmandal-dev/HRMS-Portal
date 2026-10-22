import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'
import { loginSchema } from '../../utils/validators'
import { Input, Button } from '../../components/ui'
import { UsersRound } from "lucide-react";

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
  const isLoading = useAuthStore((s) => s.isLoading)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) })

  async function onSubmit(values) {
    const success = await login(values)
    if (success) {
      toast.success('Welcome back')
      const redirectTo = location.state?.from?.pathname || '/'
      navigate(redirectTo, { replace: true })
    } else {
      toast.error('Invalid email or password')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mb-8 lg:hidden">
        <div className="flex items-center gap-2.5">
          {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500">
            <svg viewBox="0 0 32 32" fill="none" className="h-4 w-4">
              <path d="M9 9V23M9 16H16M16 9V23M23 9V23" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div> */}
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
            <UsersRound
              className="h-6 w-6 text-white"
              strokeWidth={1.8}
              aria-hidden="true"
           />
          </div>
          <span className="font-display text-lg font-semibold text-ink">HRMS</span>
        </div>
      </div>

      <h1 className="font-display text-display-sm font-semibold text-ink">Sign in</h1>
      <p className="mt-1.5 text-sm text-slate-500">Enter your work email and password to continue.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4">
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          error={errors.email?.message}
          required
          {...register('email')}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            required
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>

        <Button type="submit" size="lg" isLoading={isLoading} className="mt-2 w-full">
          Sign in
          {!isLoading && <ArrowRight size={16} />}
        </Button>
      </form>

      <p className="mt-8 text-center text-xs text-slate-400">
        Access is provisioned by your HR team. Contact them if you need an account.
      </p>
    </motion.div>
  )
}
