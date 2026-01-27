import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import PlansPreview from "@/components/home/PlansPreview";
import RecentWithdrawals from "@/components/home/RecentWithdrawals";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <PlansPreview />
        <RecentWithdrawals />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
