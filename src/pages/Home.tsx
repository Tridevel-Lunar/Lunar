import { usePageTitle } from "@/lib/use-page-title";
import Navbar from "@/components/home/Navbar";
import HeroSection from "@/components/home/HeroSection";
import WhySpace from "@/components/home/WhySpace";
import ResearchSection from "@/components/home/ResearchSection";
import PlatformSection from "@/components/home/PlatformSection";
import LaikaSection from "@/components/home/LaikaSection";
import JoinSection from "@/components/home/JoinSection";
import Footer from "@/components/home/Footer";

export default function Home() {
  usePageTitle("Home");
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <WhySpace />
        <ResearchSection />
        <PlatformSection />
        <LaikaSection />
        <JoinSection />
      </main>
      <Footer />
    </>
  );
}
