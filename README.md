# SafeSphere integrated prototype

This is the merged prototype: SafeSphere is the main product and Safe Haven is integrated as a first-class feature.

## Run

```bash
npm install
npm run dev
```

The project expects Node.js and npm. Tailwind is loaded from the CDN in `index.html`, while icons come from `lucide-react`.

## Integrated flow

Safety map → Safe Haven → Community → SafeSpeak → SOS → My reports

Safe Haven includes:
- progressive 500 m → 1 km → 2 km search demo
- verified assistance-point cards
- lower-risk route demo
- navigation screen
- offline/cached-data state
- no-Safe-Haven fallback
- help actions
- Safe Haven admin verification demo
