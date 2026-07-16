import { createSwaggerSpec } from 'next-swagger-doc';
import { NextResponse } from 'next/server';

export const GET = async () => {
  try {
    const spec = createSwaggerSpec({
      apiFolder: 'app/api',
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Admin One API Documentation',
          version: '1.0',
          description: 'Interactive API documentation for the Admin One dashboard.',
        },
        components: {
          securitySchemes: {
            BearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
        security: [],
      },
    });

    return NextResponse.json(spec);
  } catch (error) {
    console.error("Failed to generate swagger spec:", error);
    return NextResponse.json({ error: 'Failed to generate swagger spec' }, { status: 500 });
  }
};
