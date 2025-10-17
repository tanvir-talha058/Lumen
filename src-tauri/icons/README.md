# Icon Placeholders

This directory should contain the following icon files for the Lumen Browser:

## Required Icons

- **32x32.png** - Small icon (32x32 pixels)
- **128x128.png** - Medium icon (128x128 pixels)
- **128x128@2x.png** - High-DPI medium icon (256x256 pixels)
- **icon.icns** - macOS icon bundle
- **icon.ico** - Windows icon

## Creating Icons

You can create these icons using:

### Option 1: Online Tools
- **Favicon Generator**: https://realfavicongenerator.net/
- **Icon Converter**: https://convertio.co/

### Option 2: Design Software
- **Figma** - Create a 512x512 design, then export at different sizes
- **GIMP** - Free, open-source image editor
- **Inkscape** - For vector-based designs

### Option 3: Command Line (ImageMagick)

```bash
# Create a simple colored square icon (placeholder)
convert -size 512x512 xc:"#667eea" -gravity center \
  -pointsize 200 -fill white -annotate +0+0 "L" \
  lumen-512.png

# Generate different sizes
convert lumen-512.png -resize 32x32 32x32.png
convert lumen-512.png -resize 128x128 128x128.png
convert lumen-512.png -resize 256x256 128x128@2x.png

# Create .ico (Windows)
convert lumen-512.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico

# Create .icns (macOS) - requires png2icns
png2icns icon.icns lumen-512.png
```

## Design Guidelines

### Lumen Icon Design Concept

The icon should embody the "Lightweight, Minimal, Elegant" philosophy:

**Concept Ideas:**
1. **Light Beam** - A glowing ray symbolizing "Lumen" (light)
2. **Minimal Circle** - Simple circular design with gradient
3. **Star** - ⭐ A star icon matching the emoji used in the app
4. **Letter "L"** - Stylized "L" with modern typography

**Color Scheme:**
- Primary: `#667eea` (purple-blue gradient start)
- Secondary: `#764ba2` (purple gradient end)
- Accent: White or light colors for contrast

**Style:**
- Flat design with subtle gradients
- Rounded corners (if using shapes)
- Good contrast for visibility at small sizes
- Works well in both light and dark system themes

## Temporary Placeholder

Until you create custom icons, Tauri will use default icons. The app will still work, but you'll see generic icons in the taskbar and window.

## After Creating Icons

1. Place all icon files in this directory (`src-tauri/icons/`)
2. Update `src-tauri/tauri.conf.json` if you change icon names
3. Rebuild the app: `npm run tauri:build`

The bundler will automatically include icons in the final application.
