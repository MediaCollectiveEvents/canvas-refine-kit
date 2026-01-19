const WireframeSection = ({ 
  title, 
  height = "h-32", 
  children 
}: { 
  title: string; 
  height?: string; 
  children?: React.ReactNode;
}) => (
  <div className={`border-2 border-dashed border-gray-400 ${height} flex flex-col items-center justify-center bg-gray-50 relative`}>
    <span className="text-gray-600 font-medium text-sm uppercase tracking-wide">{title}</span>
    {children}
  </div>
);

const Wireframe = () => {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">Homepage Wireframe</h1>
        <p className="text-gray-500 text-center mb-8 text-sm">The Media Collective</p>
        
        <div className="border-2 border-gray-300 bg-white shadow-lg">
          {/* Header */}
          <div className="border-b-2 border-gray-300 h-16 flex items-center justify-between px-6 bg-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-400 rounded" />
              <span className="text-xs text-gray-600 font-medium">LOGO</span>
            </div>
            <div className="flex gap-4">
              {['Home', 'About', 'Events', 'Sponsors', 'Blog'].map((item) => (
                <div key={item} className="w-12 h-3 bg-gray-300 rounded" />
              ))}
            </div>
          </div>

          {/* Hero Section */}
          <div className="h-96 bg-gray-200 flex flex-col items-center justify-center relative border-b-2 border-gray-300">
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <span className="text-6xl text-gray-400">🖼️</span>
            </div>
            <div className="z-10 text-center space-y-4">
              <div className="w-64 h-4 bg-gray-400 rounded mx-auto" />
              <div className="w-80 h-8 bg-gray-500 rounded mx-auto" />
              <div className="w-48 h-3 bg-gray-300 rounded mx-auto" />
              <div className="w-40 h-10 bg-gray-600 rounded mx-auto mt-4 flex items-center justify-center">
                <span className="text-white text-xs">CTA BUTTON</span>
              </div>
            </div>
            <span className="absolute bottom-4 text-gray-500 text-xs uppercase tracking-wide">Hero Section</span>
          </div>

          {/* About Section */}
          <div className="py-12 px-8 border-b-2 border-gray-300">
            <div className="text-center mb-6">
              <div className="w-24 h-3 bg-gray-300 rounded mx-auto mb-2" />
              <div className="w-64 h-5 bg-gray-400 rounded mx-auto mb-4" />
              <div className="w-full max-w-lg h-3 bg-gray-200 rounded mx-auto mb-2" />
              <div className="w-full max-w-md h-3 bg-gray-200 rounded mx-auto" />
            </div>
            <div className="flex justify-center gap-8 mt-8">
              {['Executives', 'Events', 'Countries'].map((stat) => (
                <div key={stat} className="text-center">
                  <div className="w-16 h-8 bg-gray-400 rounded mx-auto mb-2" />
                  <div className="w-12 h-2 bg-gray-300 rounded mx-auto" />
                </div>
              ))}
            </div>
            <span className="block text-center text-gray-500 text-xs uppercase tracking-wide mt-6">About Section</span>
          </div>

          {/* Value Pillars Section */}
          <div className="py-12 px-8 border-b-2 border-gray-300 bg-gray-50">
            <div className="text-center mb-8">
              <div className="w-48 h-5 bg-gray-400 rounded mx-auto" />
            </div>
            <div className="grid grid-cols-3 gap-6">
              {['Connect', 'Learn', 'Grow'].map((pillar) => (
                <div key={pillar} className="border-2 border-dashed border-gray-300 p-6 text-center bg-white">
                  <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-4" />
                  <div className="w-16 h-4 bg-gray-400 rounded mx-auto mb-2" />
                  <div className="w-full h-2 bg-gray-200 rounded mb-1" />
                  <div className="w-3/4 h-2 bg-gray-200 rounded mx-auto" />
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <div className="w-36 h-10 bg-gray-500 rounded mx-auto flex items-center justify-center">
                <span className="text-white text-xs">CTA BUTTON</span>
              </div>
            </div>
            <span className="block text-center text-gray-500 text-xs uppercase tracking-wide mt-6">Value Pillars Section</span>
          </div>

          {/* Testimonials Section */}
          <div className="py-12 px-8 border-b-2 border-gray-300">
            <div className="text-center mb-8">
              <div className="w-40 h-5 bg-gray-400 rounded mx-auto" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="border-2 border-dashed border-gray-300 p-6 bg-gray-50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full" />
                    <div>
                      <div className="w-20 h-3 bg-gray-400 rounded mb-1" />
                      <div className="w-16 h-2 bg-gray-300 rounded" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-2 bg-gray-200 rounded" />
                    <div className="w-full h-2 bg-gray-200 rounded" />
                    <div className="w-3/4 h-2 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
            <span className="block text-center text-gray-500 text-xs uppercase tracking-wide mt-6">Testimonials Section</span>
          </div>

          {/* Footer */}
          <div className="h-32 bg-gray-800 flex items-center justify-center">
            <div className="text-center">
              <div className="flex justify-center gap-8 mb-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-16 h-2 bg-gray-600 rounded" />
                ))}
              </div>
              <div className="flex justify-center gap-3 mb-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-6 h-6 bg-gray-600 rounded-full" />
                ))}
              </div>
              <div className="w-32 h-2 bg-gray-600 rounded mx-auto" />
            </div>
            <span className="absolute text-gray-400 text-xs uppercase tracking-wide">Footer</span>
          </div>
        </div>

        <p className="text-center text-gray-400 text-xs mt-8">
          Right-click → Save as image, or use browser print (Ctrl/Cmd + P) to export as PDF
        </p>
      </div>
    </div>
  );
};

export default Wireframe;
