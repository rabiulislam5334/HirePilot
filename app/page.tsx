import Features from '@/components/landing/Features';
import FinalCTA from '@/components/landing/FinalCTA';
import Hero from '@/components/landing/hero';
import HowItWorks from '@/components/landing/HowItWorks';
import InterviewDemo from '@/components/landing/InterviewDemo';
import Pricing from '@/components/landing/Pricing';
import Testimonials from '@/components/landing/Testimonials';
import TrustBar from '@/components/landing/TrustBar';
import Footer from '@/components/layout/Footer';
import PublicNavbar from '@/components/layout/PublicNavbar';
import React from 'react';

const homePage = () => {
  return (
    <div>
      <PublicNavbar></PublicNavbar>
     <Hero/>
     <TrustBar></TrustBar>
     <Features>
     </Features>
     <HowItWorks>
     </HowItWorks>
     <InterviewDemo></InterviewDemo>
     <Testimonials></Testimonials>
     <Pricing></Pricing>
     <FinalCTA></FinalCTA>
     <Footer></Footer>
    </div>
  );
};

export default homePage;