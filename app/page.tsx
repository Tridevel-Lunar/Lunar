import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import WhySpace from "@/components/WhySpace";
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
        <PlatformSection />
        <JoinSection />
      </main>
      <Footer />
    </>
  );
}
