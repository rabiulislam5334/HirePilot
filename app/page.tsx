import Hero from '@/components/landing/hero';
import TrustBar from '@/components/landing/TrustBar';
import PublicNavbar from '@/components/layout/PublicNavbar';
import React from 'react';

const homePage = () => {
  return (
    <div>
      <PublicNavbar></PublicNavbar>
     <Hero/>
     <TrustBar></TrustBar>

    </div>
  );
};

export default homePage;