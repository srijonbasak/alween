"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Moon, Send, Sun } from "lucide-react"

function Footerdemo() {
  const [isDarkMode, setIsDarkMode] = React.useState(false)

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  return (
    <footer className="relative border-t border-stone-200 bg-stone-50 text-stone-900 transition-colors duration-300 font-sans">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8 max-w-7xl">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <h2 className="mb-4 text-xl font-bold tracking-widest uppercase">Stay Connected</h2>
            <p className="mb-6 text-xs text-stone-550 leading-relaxed font-light">
              Join our newsletter for the latest premium decants, restocks and exclusive offers.
            </p>
            <form className="relative flex" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="Enter your email"
                className="pr-12 backdrop-blur-sm bg-white/50 border-stone-200 focus-visible:ring-stone-400 text-xs rounded-full h-10"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8 rounded-full bg-stone-900 text-white transition-transform hover:scale-105 hover:bg-stone-800"
              >
                <Send className="h-4.5 w-4.5" />
                <span className="sr-only">Subscribe</span>
              </Button>
            </form>
            <div className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
          </div>
          <div>
            <h3 className="mb-4 text-xs font-bold tracking-widest uppercase text-stone-900">Quick Links</h3>
            <nav className="space-y-2 text-xs font-light text-stone-600">
              <a href="/" className="block transition-colors hover:text-primary">
                Home
              </a>
              <a href="#collection" className="block transition-colors hover:text-primary">
                Collections
              </a>
              <a href="/combos" className="block transition-colors hover:text-primary">
                Scent Combos
              </a>
              <a href="/combo-builder" className="block transition-colors hover:text-primary">
                Custom Combos
              </a>
              <a href="/affiliate" className="block transition-colors hover:text-primary">
                Partner Portal
              </a>
            </nav>
          </div>
          <div>
            <h3 className="mb-4 text-xs font-bold tracking-widest uppercase text-stone-900">Contact Us</h3>
            <address className="space-y-2 text-xs not-italic font-light text-stone-600">
              <p className="font-bold text-stone-900">ALWEEN LUXURY SCENTS</p>
              <p>Dhaka, Bangladesh</p>
              <p>Phone: +880 1322-309746</p>
              <p>Email: support@alween.com</p>
            </address>
          </div>
          <div className="relative">
            <h3 className="mb-4 text-xs font-bold tracking-widest uppercase text-stone-900">Follow Us</h3>
            <div className="mb-6 flex space-x-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full h-8 w-8 border-stone-200 hover:bg-stone-100 hover:text-stone-900">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                      <span className="sr-only">Facebook</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-[10px]">Follow us on Facebook</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full h-8 w-8 border-stone-200 hover:bg-stone-100 hover:text-stone-900">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      <span className="sr-only">Twitter</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-[10px]">Follow us on Twitter</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full h-8 w-8 border-stone-200 hover:bg-stone-100 hover:text-stone-900">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                      <span className="sr-only">Instagram</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-[10px]">Follow us on Instagram</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full h-8 w-8 border-stone-200 hover:bg-stone-100 hover:text-stone-900">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                      <span className="sr-only">LinkedIn</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-[10px]">Connect with us on LinkedIn</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center space-x-2">
              <Sun className="h-3.5 w-3.5 text-stone-500" />
              <Switch
                id="dark-mode"
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
                className="scale-90"
              />
              <Moon className="h-3.5 w-3.5 text-stone-500" />
              <Label htmlFor="dark-mode" className="sr-only">
                Toggle dark mode
              </Label>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-stone-200/60 pt-8 text-center md:flex-row text-xs text-stone-500">
          <p>© 2026 ALWEEN LUXURY SCENTS. ALL RIGHTS RESERVED.</p>
          <nav className="flex gap-4">
            <button type="button" onClick={() => alert('PRIVACY POLICY\n\nYour privacy is important to us. We secure your personal credentials and order history. We do not sell or lease customer information to third parties.')} className="transition-colors hover:text-primary">
              Privacy Policy
            </button>
            <button type="button" onClick={() => alert('RETURN & REFUND POLICY\n\nDue to the hygiene nature of decanted fragrances, we do not accept returns. However, if your order arrives damaged, leaking, or incorrect, please email support@alween.com with photos within 24 hours of delivery for a replacement.')} className="transition-colors hover:text-primary">
              Return Policy
            </button>
            <button type="button" onClick={() => alert('TERMS OF SERVICE\n\nBy placing an order, you agree to our terms. Scent decants are hand-poured from original authentic bottles into sterile glass vials. We are an independent decanter and not affiliated with the brand owners.')} className="transition-colors hover:text-primary">
              Terms of Service
            </button>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export { Footerdemo }
