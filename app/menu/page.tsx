import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MenuPreviewWithModal } from "@/components/sections/MenuPreviewWithModal";

export default function MenuPage() {
  return (
    <main className="min-h-screen bg-cream w-full">
      <Navbar />
      <div className="pt-20 pb-8 px-4 sm:px-6 md:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-px bg-terracotta" />
            <p className="text-terracotta text-xs uppercase tracking-[0.2em] font-medium">Our menu</p>
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-dark font-light">Full menu</h1>
        </div>
      </div>
      <MenuPreviewWithModal showAll />
      <Footer />
    </main>
  );
}
