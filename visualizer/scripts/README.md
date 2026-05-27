# Scripts

## convert-svg-component.js

Automates the conversion of SVG electrical components to TypeScript React components.

### Usage

```bash
node scripts/convert-svg-component.js <svg-filename>
```

### Example

```bash
node scripts/convert-svg-component.js NRF24L01.svg
```

### What it does

1. **Runs SVGR CLI**: Converts the SVG file to a TypeScript React component
2. **Post-processes the output**:
   - Converts `<svg>` tags to `<g>` tags
   - Adds the transform attribute for proper positioning and rotation
3. **Extracts pin information**: Finds all `data-pin` attributes and displays them in the console
4. **Provides next steps**: Guides you on what to do after the component is created

### Requirements

- Node.js installed
- The SVG file should be placed in `src/components/electrical-components/svgs/`
- The SVG should contain `data-pin` attributes on elements that represent component pins

### Output

The generated TypeScript component will be created in:
```
src/components/electrical-components/elements/
```

### Next Steps After Running

1. Review the generated component
2. Add the component to `components-list.ts`:
   ```typescript
   "component-name": lazy(() => import("./elements/ComponentName")),
   ```
3. Test the component in your circuit visualizer
