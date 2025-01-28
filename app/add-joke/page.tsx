'use client'

import * as motion from "motion/react-client"
import { useState } from "react"
import { addJoke } from "@/app/add-joke/actions"
import { Button, buttonVariants } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

export default function AddJoke() {
    const [jokeText, setJokeText] = useState<string>('')

    const handleAddJoke = async () => {
        try {
            const joke = await addJoke(jokeText)
            console.log(joke)
            if (!joke) return
            setJokeText('')
        } catch (error) {
            console.error('Error adding joke:', error)
        }
    }

    return (
        <motion.div 
            className="flex flex-col w-full md:w-2/3 p-4 lg:w-1/2 items-center justify-center relative h-dvh z-30 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}>
            <Textarea className="w-full h-40 bg-white" placeholder="Enter your joke here..." value={jokeText} onChange={(e) => setJokeText(e.target.value)}/>
            <div className="flex gap-4 w-full items-center justify-center">
                <Button onClick={handleAddJoke} disabled={!jokeText}>Add joke</Button>
                <Link href="/stage" className={buttonVariants({ variant: "outline" })}>Back to stage</Link>
            </div>
        </motion.div>
    )
}
