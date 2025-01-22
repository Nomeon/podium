import { LoginForm } from "@/components/custom/loginform"
import * as motion from 'motion/react-client'

export default function Login() {
    return(
        <motion.div className='flex justify-center items-center h-screen z-10' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 1.5 }}>
            <LoginForm />
        </motion.div>
    )
}