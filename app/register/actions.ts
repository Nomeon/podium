'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
// import { createClient } from '@/utils/supabase/server'
import { formSchema } from '@/components/custom/registerform'
import { z } from 'zod'

export async function signup(values: z.infer<typeof formSchema>) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const { error } = await supabase.auth.signUp(values)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/stage')
}