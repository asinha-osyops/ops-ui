'use client'

import { useRef } from 'react'
import { HeroSection } from '@/components/landing/hero-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { ContactForm } from '@/components/landing/contact-form'

export default function LandingPage() {
  const contactRef = useRef<HTMLElement>(null)

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section with scroll fade */}
      <FeaturesSection contactSectionRef={contactRef} />

      {/* CTA Section */}
      <section
        ref={contactRef}
        id="contact"
        className="container mx-auto px-4 md:px-6 pt-[30px] min-h-[50vh] md:min-h-[70vh] flex items-center justify-center"
      >
        <div className="bg-background rounded-lg p-8 md:p-12 lg:p-16">
          <div className="flex flex-col items-center space-y-4 text-center mx-auto max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">
              We&apos;re working with early partners to shape the platform.
            </h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  )
}
