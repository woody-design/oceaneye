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
| Yellow boxfish | Ostracion cubicus | `/models/yellow-boxfish.glb` | Hyper3D Rodin web UI, Rodin Gen-2 | release-candidate |
| Spiny seahorse | Hippocampus histrix | `/models/longspine-seahorse.glb` | Hyper3D Rodin web UI, Rodin web model | release-candidate |
| Giant manta ray | Mobula birostris | `/models/giant-manta-ray.glb` | Hyper3D Rodin web UI, Rodin Gen-2 | release-candidate |
| Ocean sunfish | Mola mola | `/models/ocean-sunfish.glb` | Hyper3D Rodin web UI, Rodin web generation | release-candidate |
| Orca | Orcinus orca | `/models/orca.glb` | Hyper3D Rodin web UI, Rodin Gen-2 | release-candidate |
| Giant oarfish | Regalecus glesne | `/models/giant-oarfish.glb` | Hyper3D Rodin web UI, Rodin web generation | release-candidate |
| Dumbo octopus | Grimpoteuthis | `/models/dumbo-octopus.glb` | Hyper3D Rodin web UI, Rodin Gen-2 | release-candidate |
| Tripod fish | Bathypterois grallator | `/models/tripod-fish.glb` | Hyper3D Rodin web UI, Rodin Gen-2 | release-candidate |
| Hadal snailfish | Pseudoliparis swirei | `/models/hadal-snailfish.glb` | Hyper3D Rodin web UI, model setting not recorded | release-candidate |
| Vampire squid | Vampyroteuthis infernalis | `/models/vampire-squid.glb` | Hyper3D Rodin web UI, Rodin web generation | release-candidate |

The `release-candidate` status means the asset is included for transparent
public preview and local verification, but it should not be represented as a
final science-reviewed model.

The public files in `/models/*.glb` are web-delivery derivatives of the source
generations. They use Draco geometry compression; most textures are KTX2/Basis
GPU-compressed for browser delivery, while selected models may keep source
textures when KTX2 artifacts are more noticeable than the byte savings justify.
Geometry is intended to be near-lossless, and texture choices should be checked
visually against the local source assets before final release decisions.

## License Boundary

OceanEye-authored public content and public model files are released under CC BY
4.0 by the maintainer. Direct quotations, institution names, source names,
scientific names, trademarks, and linked external references remain subject to
their original rights and are not relicensed by OceanEye.

## Private Material Not Published

The public repo does not include internal research workspaces, project memory,
private prompts, provider downloads, Blender source files, rejected model
candidates, local run logs, or source-asset packages.
