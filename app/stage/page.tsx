'use client'

import { JokeWriter } from "@/components/custom/jokewriter";
import { useState } from "react";
import { Rating } from 'react-simple-star-rating'
import { Button } from "@/components/ui/button";
import { logout, getUserId } from '@/app/stage/actions'
import * as motion from "motion/react-client"

const fillColorArray = [
    "#f17a45",
    "#f17a45",
    "#f19745",
    "#f19745",
    "#f1a545",
    "#f1a545",
    "#f1b345",
    "#f1b345",
    "#f1d045",
    "#f1d045"
];

export default function Stage() {
    const [rating, setRating] = useState(0)

    const handleRating = (rate: number) => {
        setRating(rate)
        console.log(rate)
    }

    return(
        <motion.div className="flex flex-col w-2/3 items-center justify-center relative h-dvh z-30 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 1.5 }}>
            <JokeWriter jokeText='Have you heard about that fire at the circus? It was in tents.' />
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                <Rating
                    className="flex flex-row"
                    onClick={handleRating}
                    allowFraction
                    size={50}
                    transition
                    fillColorArray={fillColorArray}
                />
                <Button onClick={logout} variant='outline' className="">Sign out</Button>

            </div>
        </motion.div>
    )
}