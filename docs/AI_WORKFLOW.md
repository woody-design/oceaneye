# AI-Assisted Asset Workflow

OceanEye does not use runtime AI generation. The public app ships static
content JSON and static GLB model files.

AI tools may be used offline as creator/editor aids. The reusable workflow is:

1. Choose a single organism and scope.
2. Define a lightweight production packet: species, depth, must-visible
   structures, acceptable stylization, failure modes, first insight anchors,
   and source/license questions.
3. Prepare visual references and prompts outside the runtime product.
4. Generate draft model candidates with an image-to-3D provider or compare
   existing GLB candidates.
5. Reject candidates with major form, anatomy, license, or file-size problems.
6. Normalize the selected candidate in a 3D editor: orientation, scale, origin,
   mesh naming, material cleanup, triangle and texture budget, and annotation
   anchor preservation.
7. Export a static web GLB.
8. Integrate the GLB into OceanEye under a clean public path such as
   `public/models/yellow-boxfish.glb`.
9. Update the matching creature JSON with model URL, quality metadata, camera
   framing, source links, and public provenance.
10. Run local build and visual review.
11. Publish only after license, science, performance, visual, and source-copy
   review are acceptable for the intended release level.

## Review Gates

- License: the model and any upstream reference/input rights must allow public
  redistribution under the stated content/model license.
- Science: stylization must not create a materially misleading animal.
- Provenance: public JSON and docs must describe the asset path, model status,
  source links, and review limits without exposing private production notes.
- Performance: model size, triangle count, and texture weight must be suitable
  for the web target.
- Product fit: the model should support inspection and insight-card framing,
  not merely look attractive in isolation.

## Public Boundary

Public releases should include only the final static assets and public
provenance summaries. They should not include raw provider downloads, private
prompts, local editor files, rejected candidates, source-asset packages, or
internal run logs.

