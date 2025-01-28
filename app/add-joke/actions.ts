'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

interface Joke {
    joke_text: string
}

export async function addJoke(jokeText: string): Promise<Joke | null> {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase.auth.getUser()  
        if (error || !data?.user) {
            redirect('/login')
        }

        const { error: JokeError } = await supabase
            .from('new_jokes')
            .insert({ joke_text: jokeText })
            .single()

        if(JokeError) {
            console.error('Error adding joke:', JokeError)
            return null
        }

        return { joke_text: jokeText }
    } catch (error) {
        console.error('Error adding joke:', error)
        return null
    }
}