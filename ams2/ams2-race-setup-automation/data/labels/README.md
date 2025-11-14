Use this folder to store curated AMS2 UI annotations exported from Label Studio.

1. Run `npm run capture -- --note="car grid"` while navigating AMS2 menus to generate PNG+JSON pairs under `data/captures/`.
2. Import those images into Label Studio, draw bounding boxes for tiles/buttons, and export results as JSON.
3. Normalize each export to match `schema.json` and save under `data/labels/<screen>/<record>.json`.
