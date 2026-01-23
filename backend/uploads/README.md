# Uploads Directory

This directory stores uploaded assets (images, videos, documents).

## Structure

```
uploads/
├── products/          # Product images
│   └── variants/      # Product variant images
├── banners/           # Banner images
├── blogs/             # Blog post images
└── collections/       # Collection images
```

## File Naming

Files are automatically renamed with a unique identifier:
- Format: `{original-name}-{timestamp}-{random}.{ext}`
- Example: `headphones-1703001234567-abc123.jpg`

## Access

Files are publicly accessible via:
```
http://localhost:3001/uploads/{folder}/{filename}
```

## Gitignore

Add to `.gitignore` to exclude uploaded files from version control:
```
/public/uploads/*
!/public/uploads/.gitkeep
```
