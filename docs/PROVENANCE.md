# Provenance

OceanEye is a curated public release candidate. The runtime app uses static
JSON content and static GLB assets. It does not generate content or models for
users at runtime.

## Content Sources

Creature and zone records keep public source links inside their JSON files.
Those links identify the scientific, conservation, museum, university, or public
reference sources used for the user-facing cards.

Public source links are references. They do not relicense third-party pages,
quotes, images, names, trademarks, or institutional material.

## Public Model Files

| Creature | Scientific name | Public model path | Provider metadata | Status |
| --- | --- | --- | --- | --- |
| Yellow boxfish | Ostracion cubicus | `/models/yellow-boxfish.glb` | Hyper3D Rodin web UI, Rodin Gen-2 | model-draft |
| Spiny seahorse | Hippocampus histrix | `/models/longspine-seahorse.glb` | Hyper3D Rodin web UI, Rodin web model | model-draft |
| Giant manta ray | Mobula birostris | `/models/giant-manta-ray.glb` | Hyper3D Rodin web UI, Rodin Gen-2 | model-draft |
| Ocean sunfish | Mola mola | `/models/ocean-sunfish.glb` | Hyper3D Rodin web UI, Rodin web generation | model-draft |
| Orca | Orcinus orca | `/models/orca.glb` | Hyper3D Rodin web UI, Rodin Gen-2 | model-draft |
| Giant oarfish | Regalecus glesne | `/models/giant-oarfish.glb` | Hyper3D Rodin web UI, Rodin web generation | model-draft |
| Dumbo octopus | Grimpoteuthis | `/models/dumbo-octopus.glb` | Hyper3D Rodin web UI, Rodin Gen-2 | model-draft |
| Tripod fish | Bathypterois grallator | `/models/tripod-fish.glb` | Hyper3D Rodin web UI, Rodin Gen-2 | model-draft |
| Hadal snailfish | Pseudoliparis swirei | `/models/hadal-snailfish.glb` | Hyper3D Rodin web UI, model setting not recorded | model-draft |

The `model-draft` status is intentional for this release candidate. It means
the asset is included for transparent preview and local verification, but it
should not be represented as a final science-reviewed model.

## License Boundary

OceanEye-authored public content and public model files are released under CC BY
4.0 by the maintainer. Before a broader public launch, the maintainer should
confirm that upstream generation-provider terms and any reference-input rights
allow redistribution under that boundary.

## Private Material Not Published

The public repo does not include internal research workspaces, project memory,
private prompts, provider downloads, Blender source files, rejected model
candidates, local run logs, or source-asset packages.

