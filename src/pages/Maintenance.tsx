// src/pages/Maintenance.tsx
import React from "react";

const Maintenance: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50 px-4">
      <div className="max-w-xl text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          We’ll be back soon
        </h1>
        <p className="text-slate-300 mb-6">
          The site is temporarily offline while we perform some updates and
          improvements.
        </p>
        <p className="text-xs text-slate-500">
          If you need to contact us urgently, please use the usual channels.
        </p>
      </div>
    </div>
  );
};

export default Maintenance;