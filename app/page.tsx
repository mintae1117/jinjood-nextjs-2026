import HeroBanner from "@/components/home/HeroBanner";
import FeaturedMenu from "@/components/home/FeaturedMenu";
import GiftSets from "@/components/home/GiftSets";
import VideoSection from "@/components/home/VideoSection";
import SNSSection from "@/components/home/SNSSection";
import {
  sampleBanners,
  sampleMenuItems,
  sampleGiftSets,
} from "@/data/sampleData";

export default function HomePage() {
  return (
    <>
      <HeroBanner banners={sampleBanners} />
      <FeaturedMenu menuItems={sampleMenuItems} />
      <GiftSets giftSets={sampleGiftSets} />
      <VideoSection />
      <SNSSection />
    </>
  );
}
