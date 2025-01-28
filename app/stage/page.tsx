'use client'

import { useEffect, useState } from "react";
import { Rating } from 'react-simple-star-rating'
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { logout, getUserDetails, getJoke, rateJoke } from '@/app/stage/actions'
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

// Add joke box

export default function Stage() {
    const [userId, setUserId] = useState<number>(0)
    const [jokeText, setJokeText] = useState<string>('')
    const [jokeId, setJokeId] = useState<number>(0)
    const [rating, setRating] = useState<number>(0)

    const fetchJoke = async (userId: number, last5JokeIds: number[]) => {
        try {
            const joke = await getJoke(userId, last5JokeIds)
            if (!joke) return
            setJokeText(joke.joke_text)
            setJokeId(joke.joke_id)
        } catch (error) {
            console.error('Error fetching data:', error)
        }
    }

    const handleRating = async (rating: number) => {
        try {
            const rateValue = await rateJoke(userId, jokeId, rating)
            setRating(rating)
            setJokeText('')
            if (rateValue) {
                const userDetails = await getUserDetails()
                if (!userDetails) return 
                setRating(0)
                await fetchJoke(userId, userDetails.last5JokeIds)
            }
        } catch (error) {
            console.error('Error rating joke:', error)
        }
    }

    useEffect(() => {
        const initialize = async () => {
            try {
                const userDetails = await getUserDetails()
                if (!userDetails) return
                setUserId(userDetails.userId)
                await fetchJoke(userDetails.userId, userDetails.last5JokeIds)
            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }
        initialize()
    }, []);

    return(
        <>
            <motion.div className="flex flex-col w-full md:w-2/3 p-4 lg:w-1/2 items-center justify-center relative h-dvh z-30 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 1.5 }}>
                { jokeText ? <h2 className="font-medium md:text-lg text-center">{jokeText}</h2> : 
                    <div className="flex flex-col items-center justify-center gap-3 w-full pb-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div> 
                }
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                    <Rating
                        emptyColor="white"
                        className="flex flex-row"
                        onClick={handleRating}
                        initialValue={rating}
                        allowFraction
                        size={50}
                        transition
                        
                        fillColorArray={fillColorArray}
                    />
                    <Button onClick={logout} variant='outline' className="">Sign out</Button>
                </div>
            </motion.div>
        </>
    )
}