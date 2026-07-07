import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import WhySpace from "@/components/WhySpace";
import ResearchSection from "@/components/ResearchSection";
import PlatformSection from "@/components/PlatformSection";
import JoinSection from "@/components/JoinSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <WhySpace />
        <ResearchSection />
        <PlatformSection />
        <JoinSection />
      </main>
      <Footer />
    </>
  );
}
