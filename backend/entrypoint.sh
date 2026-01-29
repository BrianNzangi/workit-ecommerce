#!/bin/sh
set -e

# Path to the uploads directory in the volume
TARGET_DIR="/app/backend/uploads"
# Path to the temporary uploads directory from the image build
SOURCE_DIR="/app/backend/uploads_static"

echo "🚀 Starting Backend Service..."

# Check if target directory exists and is empty
if [ -d "$SOURCE_DIR" ]; then
    if [ "$(ls -A $TARGET_DIR 2>/dev/null)" ]; then
        echo "📂 Uploads directory already contains files. Skipping initialization."
    else
        echo "📦 Initializing uploads directory with default assets..."
        cp -R $SOURCE_DIR/. $TARGET_DIR/
        chmod -R 777 $TARGET_DIR
        echo "✅ Initialization complete."
    fi
fi

# Start the application
exec node backend/dist/main.js
