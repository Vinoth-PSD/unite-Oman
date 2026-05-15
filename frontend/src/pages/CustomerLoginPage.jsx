import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate, useLocation } from 'react-router-dom'
import { z } from 'zod'


export default function CustomerLoginPage() {
    const [isLogin, setIsLogin] = useState(true)
    const navigate = useNavigate()
    const location = useLocation()
    const redirectTo = location.state?.redirectTo || '/'

    const loginSchema = z.object({
        email: z
            .string()
            .min(1, 'Email is required')
            .email('Enter valid email'),

        password: z
            .string()
            .min(1, 'Password is required')
    })

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
    })
    const [errors, setErrors] = useState({})

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const result = loginSchema.safeParse(formData)

        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors

            setErrors({
                email: fieldErrors.email?.[0],
                password: fieldErrors.password?.[0],
            })

            return
        }

        setErrors({})
        const staticUsers = [
            { email: 'dhivyatest1@gmail.com', password: 'Dhivya@12', name: 'Dhivya Test 1' },
            { email: 'dhivyatest2@gmail.com', password: 'Dhivya@12', name: 'Dhivya Test 2' },
        ]

        if (isLogin) {
            const matchedUser = staticUsers.find(
                (u) => u.email === formData.email && u.password === formData.password
            )
            if (matchedUser) {
                // ✅ Save customer to localStorage
                localStorage.setItem('customerUser', JSON.stringify(matchedUser))
                toast.success(`Welcome ${matchedUser.name}`)
                navigate(redirectTo, { replace: true }) // ✅ Go back to booking page
            } else {
                toast.error('Invalid email or password')
            }
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center mx-auto mb-4">
                        <User size={30} />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900">
                        {isLogin ? 'Customer Login' : 'Create Account'}
                    </h1>

                    <p className="text-sm text-gray-400 mt-2">
                        {isLogin
                            ? 'Login to continue booking services'
                            : 'Create your customer account'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Full Name */}
                    {!isLogin && (
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                                Full Name
                            </label>

                            <div className="relative">
                                <User
                                    size={16}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                                />

                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-pink-500"
                                />
                            </div>
                        </div>
                    )}

                    {/* Email */}
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                            Email Address
                        </label>

                        <div className="relative">
                            <Mail
                                size={16}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                            />

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="example@gmail.com"
                                className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-pink-500"
                            />
                        </div>
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1 font-medium">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                            Password
                        </label>

                        <div className="relative">
                            <Lock
                                size={16}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                            />

                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-pink-500"
                            />
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1 font-medium">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-xl font-bold transition-all"
                    >
                        {isLogin ? 'Login' : 'Create Account'}
                    </button>
                </form>

                {/* Toggle */}
                <div className="text-center mt-6 pt-6 border-t border-gray-100 text-sm text-gray-500">
                    {isLogin
                        ? "Don't have an account?"
                        : 'Already have an account?'}

                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="ml-2 text-pink-600 font-bold hover:underline"
                    >
                        {isLogin ? 'Register' : 'Login'}
                    </button>
                </div>

                {/* Back */}
                {/* <Link
          to="/"
          className="block text-center mt-6 text-sm text-gray-400 hover:text-pink-600"
        >
          ← Back to Home
        </Link> */}
            </div>
        </div>
    )
}