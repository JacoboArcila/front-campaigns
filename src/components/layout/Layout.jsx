import React from 'react';
import PropTypes from 'prop-types';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* <Header /> */}

      <div className="flex flex-1">
        <main className="flex-1 p-4 md:p-6 bg-neutral-50">
          <div className="container-custom">{children}</div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
