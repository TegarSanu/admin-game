"use client";

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

// SwaggerUI must be rendered on the client
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDoc() {
  return (
    <div className="bg-white min-h-screen text-black">
      <div className="max-w-7xl mx-auto p-4 sm:p-8">
        <SwaggerUI url="/api/swagger" />
      </div>
    </div>
  );
}
