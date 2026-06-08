# OceanEye

An open-source, interactive 3D atlas of ocean life.

**Live: [https://oceaneye.woodydesign.io](https://oceaneye.woodydesign.io)**

<video src="docs/media/oceaneye-demo.mp4" controls muted playsinline width="100%"></video>

[Open the demo video](docs/media/oceaneye-demo.mp4)

## Why I Built This

All the 3D models and background visual effects here are only a clumsy imitation of nature.

I started OceanEye as an experiment in how far one person could push the complexity of a web app with current AI-assisted tools, and as a way to explore possible forms of future education and games. I also wanted to see whether I, working alone with almost no 3D modeling experience, could carry the whole process through: from research, to visual references, to models, to designing and developing the web experience.

But when I built the first model and began reading seriously about these creatures' scientific facts and survival mechanisms, I found myself deeply drawn to these miracles of nature. After a while, the project stopped being only an experiment, and began to carry more meaning for me.

Every decision here tries to respect science and reality as much as I could manage, and it still falls short in plenty of places. The AI-generated models have noticeable flaws and are not science-reviewed, and some biological details are still approximate.

If it sparks even a little curiosity in you about these animals, the ocean, and our blue planet, then this project has done what it was meant to do.

The name comes from Billie Eilish's "Ocean Eyes." The core idea sparked while I was watching her concert film, *Hit Me Hard and Soft: The Tour*.

## How It's Made

The runtime is a static site: React, Vite, React Three Fiber + drei, Three.js, and TypeScript. Everything is pre-made static JSON records and static GLB models with visible source links.

Each model came through a pipeline:

- Deep research for each species
- Study of visual references: natural-history illustration and scientific imagery
- Generate reference images with Gemini
- Generate the 3D model from those references with Hyper3D Rodin
- Web compression: Draco geometry + KTX2/UASTC textures, self-hosted decoders
- Editorial: research, write, and curate the cards
- Camera setup: record a viewing angle for each card

Background shader prototyped in Claude design. Production code and operational tasks in OpenAI Codex. Code review in Claude Code.

## Design Choices

- The interface stays quiet so the animal remains the center of attention. Every design decision serves one goal: to evoke and share a little of the wonder of nature through curated content.
- An illustrative style rather than photoreal models keeps the detail manageable. The goal is to spark interest, not to be scientifically perfect.
- Colors are pulled from real ocean imagery, and the shader and particles try to match the feel of each depth: sunlight up top, drifting marine snow down in the abyssal zone.
- Navigation by depth. Five zones; you descend through them.
- Curated content. One person wrote and source-checked all of it: careful, but limited. Corrections are welcome.
- Sources on every card, so claims can be traced back.

## What I Learned

- AI 3D generation now still struggles with transparent bodies. The barreleye and Enypniastes models both failed. Rodin still cannot handle transparent structures well, or maybe that is just my skill level.
- Eyes go wrong easily. I regenerated the dumbo octopus several times and the eyes still are not quite right. The tripod fish's eye came out too large and cartoonish.
- Fact-checking the marine biology alone is a huge amount of work. Sources disagree, depth ranges especially. I spent about a week cross-checking, and even then many sources do not fully agree.

## Run It Locally

Use Node.js `^20.19.0` or `>=22.12.0`.

```bash
npm install
npm run dev        # local dev server
npm run build      # type-check + production build
npm run preview    # serve the production build
npm run lint
npm run test
```

## Contributing

This is a solo project and still an MVP, so the most useful help right now is:

- Science corrections: found a factual error? Open a [content correction issue](https://github.com/woody-design/oceaneye/issues/new/choose) with a source.
- Bug reports: use the [bug report issue template](https://github.com/woody-design/oceaneye/issues/new/choose).
- Models / new creatures: heavier lift; open an issue first and let's talk.

See [CONTRIBUTING.md](CONTRIBUTING.md) for details. I maintain this in my spare time, so responses may be slow.

## Credits, Inspiration, License

Inspiration: Billie Eilish's "Ocean Eyes"; BBC's *Blue Planet*; and [3DCellForge](https://github.com/huangserva/3DCellForge) as a reference for AI-assisted 3D exploration.

Sources: Wikipedia, NOAA, WHOI, MBARI, FishBase, Smithsonian Ocean, and others, listed per creature and on the About page.

Provenance: see [docs/PROVENANCE.md](docs/PROVENANCE.md) for model notes and [docs/AI_WORKFLOW.md](docs/AI_WORKFLOW.md) for the offline AI-assisted asset workflow.

License: code [MIT](LICENSE); OceanEye-authored content and model files [CC BY 4.0](CONTENT_LICENSE.md). Names, sources, linked references, and quoted material keep their own rights.

Designed by [Woody](https://woodydesign.io/) & [OC](https://openai.com/index/introducing-gpt-5-5/), [CD](https://www.anthropic.com/news/claude-design-anthropic-labs), [GG](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-lite-preview), [HR](https://hyper3d.ai/workspace/rodin), [AC](https://www.anthropic.com/news/claude-opus-4-8) in NYC.
