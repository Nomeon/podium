'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
// import { createClient } from '@/utils/supabase/server'
import { formSchema } from '@/components/custom/loginform'
import { z } from 'zod'

export async function login(values: z.infer<typeof formSchema>) {
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword(values)

    if (error) {
        redirect('/error')
    }

    revalidatePath('/', 'layout')
    redirect('/account')
}

export async function loginWithGoogle() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'http://localhost:3000/auth/callback',
    },
  })
  
  if (data.url) {
    redirect(data.url) // use the redirect API for your server framework
  }

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/stage')
}