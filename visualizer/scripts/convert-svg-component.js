#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Script to automate SVG to TypeScript component conversion
 * Usage: node scripts/convert-svg-component.js <svg-filename>
 * Example: node scripts/convert-svg-component.js NRF24L01.svg
 */

const svgFileName = process.argv[2];

if (!svgFileName) {
    console.error('❌ Error: Please provide an SVG filename');
    console.log('Usage: node scripts/convert-svg-component.js <svg-filename>');
    console.log('Example: node scripts/convert-svg-component.js NRF24L01.svg');
    process.exit(1);
}

const svgDir = path.join(__dirname, '..', 'src', 'components', 'electrical-components', 'svgs');
const outputDir = path.join(__dirname, '..', 'src', 'components', 'electrical-components', 'elements');
const svgPath = path.join(svgDir, svgFileName);

// Check if SVG file exists
if (!fs.existsSync(svgPath)) {
    console.error(`❌ Error: SVG file not found at ${svgPath}`);
    process.exit(1);
}

console.log(`🔄 Converting ${svgFileName}...`);

try {
    // Step 1: Run SVGR CLI
    console.log('📦 Running SVGR CLI...');
    execSync(`npx @svgr/cli --typescript --out-dir "${outputDir}" "${svgPath}"`, {
        stdio: 'inherit'
    });

    // Get the output filename (SVGR converts to PascalCase)
    const baseName = path.basename(svgFileName, '.svg');
    const componentName = baseName.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
        .replace(/^([a-z])/, (g) => g.toUpperCase());
    const outputFilePath = path.join(outputDir, `${componentName}.tsx`);

    if (!fs.existsSync(outputFilePath)) {
        console.error(`❌ Error: Output file not found at ${outputFilePath}`);
        process.exit(1);
    }

    // Step 2: Post-process the file
    console.log('🔧 Post-processing generated file...');
    let content = fs.readFileSync(outputFilePath, 'utf8');

    // Convert <svg> to <g>
    content = content.replace(/<svg\s+/g, '<g ');
    content = content.replace(/<\/svg>/g, '</g>');

    // Add transform attribute to the opening g tag
    const transformAttr = 'transform={`translate(${props.x || 0}, ${props.y || 0}), scale(1), rotate(${props.rotate || 0})`}';
    content = content.replace(/<g\s+([^>]*?)>/g, (match, attrs) => {
        // Only add transform to the first/outer g tag
        if (!content.includes(transformAttr)) {
            return `<g ${attrs}\n    ${transformAttr}\n  >`;
        }
        return match;
    });

    // Write the modified content back
    fs.writeFileSync(outputFilePath, content, 'utf8');

    // Step 3: Extract and display data-pin attributes
    console.log('\n📌 Extracting pin information...');
    const dataPinRegex = /data-pin="([^"]+)"/g;
    const pins = [];
    let match;

    while ((match = dataPinRegex.exec(content)) !== null) {
        pins.push(match[1]);
    }

    if (pins.length > 0) {
        console.log(`\n✅ Found ${pins.length} pin(s):`);
        pins.forEach((pin, index) => {
            console.log(`   ${index + 1}. ${pin}`);
        });
    } else {
        console.log('\n⚠️  No data-pin attributes found in the component');
    }

    console.log(`\n✨ Successfully created component: ${outputFilePath}`);
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Review the generated component at: ${path.relative(process.cwd(), outputFilePath)}`);
    console.log(`   2. Add it to components-list.ts`);
    console.log(`   3. Test the component in your circuit`);

} catch (error) {
    console.error('❌ Error during conversion:', error.message);
    process.exit(1);
}
