'use client'

export const dynamic = 'force-dynamic'

export default function AboutPage() {
  return (
    <main className="bg-cream flex-1 font-primary py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-medium text-charcoal mb-8">About Us</h1>

        {/* Who We Are Section */}
        <div className="bg-card rounded-lg shadow-sm border border-warm-gray/10 p-6 mb-6">
          <h2 className="text-2xl font-medium text-charcoal mb-4">
            Who We Are
          </h2>
          <div className="text-warm-gray">
            <p className="italic">[Content coming soon]</p>
          </div>
        </div>

        {/* What We Do Section */}
        <div className="bg-card rounded-lg shadow-sm border border-warm-gray/10 p-6 mb-6">
          <h2 className="text-2xl font-medium text-charcoal mb-4">
            What We Do
          </h2>
          <div className="text-warm-gray">
            <p className="italic">[Content coming soon]</p>
          </div>
        </div>

        {/* Founders Section */}
        <div className="bg-card rounded-lg shadow-sm border border-warm-gray/10 p-6">
          <h2 className="text-2xl font-medium text-charcoal mb-6">Founders</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Aashish */}
            <div className="bg-cream/30 rounded-lg p-6">
              <h3 className="text-xl font-medium text-charcoal mb-3">
                Aashish
              </h3>
              <div className="text-warm-gray">
                <p className="italic">[Content coming soon]</p>
              </div>
            </div>

            {/* Karina */}
            <div className="bg-cream/30 rounded-lg p-6">
              <h3 className="text-xl font-medium text-charcoal mb-3">Karina</h3>
              <div className="text-warm-gray">
                <p className="italic">[Content coming soon]</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
