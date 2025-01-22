'use client'

import { TypeAnimation } from "react-type-animation";

const JokeWriter = ({ jokeText }: { jokeText: string }) => {
    return (
        <TypeAnimation
            sequence={[2000, jokeText]}
            wrapper="h3"
            speed={60}
            cursor={false}
            className="text-black text-2xl md:text-3xl -mt-16"
        />
    );
}

export { JokeWriter }