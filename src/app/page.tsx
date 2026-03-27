"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b font-sans">
        <Link className="flex items-center justify-center font-bold text-xl tracking-tight" href="/">
          🚀 focus
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#pricing">
            Pricing
          </Link>
          <Link href="/login">
            <Button variant="ghost" className="font-semibold">Log in</Button>
          </Link>
          <Link href="/register">
            <Button className="font-semibold rounded-full px-6">Get Started free</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full py-20 md:py-32 lg:py-48 flex items-center justify-center text-center">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center space-y-4"
            >
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm mb-4">
                The ultimate Asana alternative
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Manage your work, <br />
                <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">
                  master your time.
                </span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-basis/relaxed pt-4 pb-8">
                The only productivity platform you need. Seamlessly combining Kanban boards, Gantt charts, real-time collaboration, and time tracking.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="rounded-full h-12 px-8 text-base">
                    Start for free
                  </Button>
                </Link>
                <Link href="#demo">
                  <Button variant="outline" size="lg" className="rounded-full h-12 px-8 text-base">
                    Book a Demo
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Feature section spacer placeholder */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6 mx-auto text-center">
             <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-8">Everything you need to scale</h2>
             <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {['Kanban Boards', 'Timeline Gantts', 'Goal Tracking', 'Real-time Chat', 'Automations', 'Custom Fields'].map((feature, i) => (
                  <motion.div 
                    key={i} 
                    className="p-6 bg-card rounded-2xl shadow-sm border text-left"
                    whileHover={{ y: -5 }}
                  >
                    <h3 className="text-xl font-bold mb-2">{feature}</h3>
                    <p className="text-muted-foreground">Manage your team efficiently with integrated tools explicitly built for velocity.</p>
                  </motion.div>
                ))}
             </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t font-sans">
        <p className="text-xs text-muted-foreground">
          © 2026 focus Inc. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
