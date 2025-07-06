-- Add website URL column to skills table
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Update existing skills with their official website URLs
UPDATE public.skills SET website_url = 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' WHERE name = 'JavaScript';
UPDATE public.skills SET website_url = 'https://www.typescriptlang.org/' WHERE name = 'TypeScript';
UPDATE public.skills SET website_url = 'https://react.dev/' WHERE name = 'React';
UPDATE public.skills SET website_url = 'https://nextjs.org/' WHERE name = 'Next.js';
UPDATE public.skills SET website_url = 'https://nodejs.org/' WHERE name = 'Node.js';
UPDATE public.skills SET website_url = 'https://developer.mozilla.org/en-US/docs/Web/HTML' WHERE name = 'HTML/CSS';
UPDATE public.skills SET website_url = 'https://tailwindcss.com/' WHERE name = 'Tailwind CSS';
UPDATE public.skills SET website_url = 'https://graphql.org/' WHERE name = 'GraphQL';
UPDATE public.skills SET website_url = 'https://www.postgresql.org/' WHERE name = 'PostgreSQL';
UPDATE public.skills SET website_url = 'https://aws.amazon.com/' WHERE name = 'AWS';
UPDATE public.skills SET website_url = 'https://www.docker.com/' WHERE name = 'Docker';
UPDATE public.skills SET website_url = 'https://git-scm.com/' WHERE name = 'Git';

-- Update icon names to use proper tech icons
UPDATE public.skills SET icon = 'javascript' WHERE name = 'JavaScript';
UPDATE public.skills SET icon = 'typescript' WHERE name = 'TypeScript';
UPDATE public.skills SET icon = 'react' WHERE name = 'React';
UPDATE public.skills SET icon = 'nextjs' WHERE name = 'Next.js';
UPDATE public.skills SET icon = 'nodejs' WHERE name = 'Node.js';
UPDATE public.skills SET icon = 'html5' WHERE name = 'HTML/CSS';
UPDATE public.skills SET icon = 'tailwindcss' WHERE name = 'Tailwind CSS';
UPDATE public.skills SET icon = 'graphql' WHERE name = 'GraphQL';
UPDATE public.skills SET icon = 'postgresql' WHERE name = 'PostgreSQL';
UPDATE public.skills SET icon = 'aws' WHERE name = 'AWS';
UPDATE public.skills SET icon = 'docker' WHERE name = 'Docker';
UPDATE public.skills SET icon = 'git' WHERE name = 'Git';
