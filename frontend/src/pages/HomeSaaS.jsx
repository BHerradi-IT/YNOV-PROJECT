import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import UseCases from '../components/UseCases';
import Compatibility from '../components/Compatibility';
import CallToAction from '../components/CallToAction';
import FooterSaaS from '../components/FooterSaaS';
import '../styles/responsive.css';

function HomeSaaS() {
  return (
    <div className="HomeSaaS">
      <Hero />
      <Features />
      <HowItWorks />
      <UseCases />
      <Compatibility />
      <CallToAction />
      <FooterSaaS />
    </div>
  );
}

export default HomeSaaS;
