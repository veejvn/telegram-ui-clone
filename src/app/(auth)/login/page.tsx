'use client'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  const router = useRouter()
  const isLogging = useAuthStore(state => state.isLogging)
  const login = useAuthStore(state => state.login)

  // Nếu đã login thì chuyển thẳng vào trang chat
  useEffect(() => {
    if (isLogging) {
      router.replace('/chat')
    }
  }, [isLogging, router])

  // Callback khi login thành công
  const handleSuccess = (token: string) => {
    login(token)
    router.replace('/chat')
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <LoginForm onSuccess={handleSuccess} />
    </div>
  )
}
