import React from 'react';
import NavbarLayout from '@theme/Navbar/Layout';
import NavbarContent from '@theme/Navbar/Content';
export default function Navbar() {
  return (
    <div>
      <div id="cookie-banner"></div>
      <NavbarLayout>
        <NavbarContent />
      </NavbarLayout>
    </div>
  );
}
