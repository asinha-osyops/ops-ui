'use client'

export const dynamic = 'force-dynamic'

export default function ContactPage() {
  return (
    <main className="bg-cream flex-1 font-primary py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-medium text-charcoal mb-8">Contact Us</h1>

        {/* Get In Touch Section */}
        <div className="bg-card rounded-lg shadow-sm border border-warm-gray/10 p-6">
          <h2 className="text-2xl font-medium text-charcoal mb-6">
            Get In Touch With Us
          </h2>

          <div className="space-y-6">
            {/* Email */}
            <div>
              <h3 className="text-sm font-medium text-warm-gray mb-2">Email</h3>
              <a
                href="mailto:info@osyops.ai"
                className="text-lg text-electric-blue hover:text-primary-hover transition-colors"
              >
                info@osyops.ai
              </a>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-sm font-medium text-warm-gray mb-2">
                Address
              </h3>
              <div className="text-lg text-charcoal">
                <p>OSY Operations</p>
                <p>3 Hanover Square</p>
                <p>New York, NY 10004</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
