import { HeroSection } from '../components/sections/HeroSection';
import { FeaturedContentSection } from '../components/sections/FeaturedContentSection';
import { RegionalSection } from '../components/sections/RegionalSection';
import { Newsletter } from '../components/ui';

export function HomePage() {
  return (
    <div>
      <HeroSection />
      <FeaturedContentSection />
      <RegionalSection />
      
      {/* Newsletter Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Newsletter variant="hero" />
      </section>
    </div>
  );
}
