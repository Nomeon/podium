import type { Metadata } from "next";
import "./globals.css";
import { Scene } from "@/components/custom/scene";

export const metadata: Metadata = {
  title: "Humor Podium - The best place for tailored jokes",
  description: "Created by Stijn, Omar, Muhammad",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className='font-raleway'>
        <Scene />
        <main className="flex flex-col items-center justify-center w-full h-full">
          {children}
        </main>
      </body>
    </html>
  );
}
