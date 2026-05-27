# Circuit from Prompt
## Adding new electrical components
1. add the components SVG file in `src\components\electrical-components\svgs`.

2. Run the command below for generating typescript component for the svg
```bash
npx @svgr/cli --typescript --out-dir src\components\electrical-components\elements .\src\components\electrical-components\svgs\<FILENAME>.svg
```

3. Modify the `svg` tag to g and add this attribute. 
4. add the `data-pin` attribute to the pin specifying pin name.
5. add the new component in ``
5. Use the `ComponentsPinMappers.tsx` to retrieve `components-pins.ts`.
