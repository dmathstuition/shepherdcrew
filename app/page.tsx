import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { JoinForm } from "@/components/site/JoinForm";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { MissionVision } from "@/components/sections/MissionVision";
import { Visioneer } from "@/components/sections/Visioneer";
import { Programs } from "@/components/sections/Programs";
import { MjfGoals } from "@/components/sections/MjfGoals";
import { Faith } from "@/components/sections/Faith";
import { PastPrograms } from "@/components/sections/PastPrograms";
import { Testimonies } from "@/components/sections/Testimonies";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <MissionVision />
        <Visioneer />
        <Programs />
        <MjfGoals />
        <Faith />
        <PastPrograms />
        <Testimonies />
        <JoinForm />
      </main>
      <Footer />
    </>
  );
}
