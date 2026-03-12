import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="bg-black min-h-[calc(100vh-160px)] flex flex-col items-center justify-center">
      {/* Full screen moon image section */}
      <div className="w-full relative">
        <img 
          src="https://images.unsplash.com/photo-1522030299830-16b8d3d049d5?auto=format&fit=crop&q=80&w=2000" 
          alt="Lunar Moon and Stars" 
          className="w-full h-[80vh] md:h-screen object-cover opacity-90 block"
        />
        {/* Optional overlay gradient to blend nicely with the page if needed */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default HomePage;
