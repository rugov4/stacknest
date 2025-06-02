# Stacknest Thumbnail Generator

A powerful thumbnail generator for content creators, featuring YouTube integration, AI-powered suggestions, and advanced editing capabilities.

## Setup Instructions

### Prerequisites
- Node.js (v18 or later)
- Git
- npm (comes with Node.js)

### Installation Steps

1. Clone the repository:
```bash
git clone [YOUR_GITHUB_REPO_URL]
cd thumbnail-generator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit:
- http://localhost:3000 or
- http://localhost:3001 (if port 3000 is in use)

## Features
- Drag and drop image upload
- YouTube thumbnail extraction
- Text overlay with customization
- AI-powered content suggestions
- Template system

## Development
The project uses:
- Next.js 13+ with App Router
- TypeScript
- Tailwind CSS
- React Dropzone
- Canvas API for image manipulation

## Project Structure
```
src/
  ├── app/              # Next.js app router
  ├── components/       # React components
  │   ├── FileUpload.tsx
  │   └── ImageEditor.tsx
  └── utils/           # Utility functions
      └── youtube.ts
```

## Contributing
1. Create a branch for your feature
2. Make your changes
3. Submit a pull request

## License
MIT
