'use client'

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { login, loginWithGoogle } from "@/app/login/actions";
import { FaGoogle } from "react-icons/fa";
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const formSchema = z.object({
  email: z.string().email({
    message: 'Dit is geen geldig e-mailadres',
  }),
  password: z.string().min(8, {
    message: 'The password has to be at least 8 characters long',
  }).max(50, {
    message: 'The password can be at most 50 characters long',
  }),
})

export function LoginForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: ''
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    login(values);
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your credentials to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input placeholder="E-mail" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem className="grid gap-2">
                <div className="flex items-center">
                  <FormLabel>Password</FormLabel>
                  <Link href="#" className="ml-auto inline-block text-sm underline">
                    Forgot your password?
                  </Link>
                </div>
                <FormControl>
                  <Input type="password" placeholder="Wachtwoord" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid gap-4">
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
          </form>
        </Form>
          <div className="flex justify-between items-center pt-4">
            <p>Or login with: </p>
            <div className="flex gap-4">
              <Button onClick={loginWithGoogle} variant="outline">
                <FaGoogle />
              </Button>
            </div>
          </div>
          <div className="mt-4 text-center text-sm">
            Haven't got an account yet?{" "}
            <Link href="/register" className="underline">
              Register
            </Link>
          </div>
      </CardContent>
    </Card>
  )
}
