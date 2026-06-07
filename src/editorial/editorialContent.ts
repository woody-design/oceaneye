import type { Locale } from '../types/creature'

export type EditorialLink = {
  label: string
  href?: string
  note?: string
}

export type EditorialCredit = {
  ariaLabel: string
  parts: EditorialInlinePart[]
}

export type EditorialInlinePart = {
    text: string
    href?: string
}

export type EditorialInlineContent = string | EditorialInlinePart[]

export type EditorialContent = {
  navLabel: string
  railLabel: string
  title: string
  subtitle: string
  githubLink: EditorialLink
  credit: EditorialCredit
  sections: Array<{
    title: string
    body?: string[]
    items?: EditorialInlineContent[]
    links?: EditorialLink[]
  }>
  personalLinks: {
    title: string
    links: EditorialLink[]
  }
  quote: {
    title: string
    body: string
  }
}

export const editorialContent: Record<Locale, EditorialContent> = {
  en: {
    navLabel: 'About OceanEye',
    railLabel: 'Editorial links',
    title: 'OceanEye',
    subtitle: 'An open-source, interactive 3D atlas of ocean life.',
    githubLink: {
      label: 'GitHub',
      href: 'https://github.com/woody-design/oceaneye',
    },
    credit: {
      ariaLabel: 'Designed by Woody & OC, CD, GG, HR, AC in NYC',
      parts: [
        { text: 'Designed by ' },
        { text: 'Woody', href: 'https://woodydesign.io/' },
        { text: ' & ' },
        { text: 'OC', href: 'https://openai.com/index/introducing-gpt-5-5/' },
        { text: ', ' },
        { text: 'CD', href: 'https://www.anthropic.com/news/claude-design-anthropic-labs' },
        { text: ', ' },
        { text: 'GG', href: 'https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-lite-preview' },
        { text: ', ' },
        { text: 'HR', href: 'https://hyper3d.ai/workspace/rodin' },
        { text: ', ' },
        { text: 'AC', href: 'https://www.anthropic.com/news/claude-opus-4-8' },
        { text: ' in NYC' },
      ],
    },
    sections: [
      {
        title: "Editor's notes:",
        body: [
          '“All the 3D models and visual effects here are only a clumsy imitation of nature.',
          'Limited by the current state of AI-assisted 3D modeling, web performance, and file size, many biological details are still hard to make strictly scientifically accurate. The editing, fact-checking, and model review are also currently done by myself alone. Although I spent about a week reading and cross-checking sources, there is still a lot of room for improvement in the content.',
          'I first created this project to explore how far AI vibe coding could push the complexity of a web app, and the possible forms of future education and games. I also wanted to see whether I, working alone with almost no 3D modeling experience, could carry the whole process through: from research, to illustrations, to models, to designing and developing a web experience. But when I made the first model and began reading seriously about these creatures’ scientific facts and survival mechanisms, I found myself deeply drawn to these miracles of nature. After a while, the project stopped being only an experiment, and began to carry more meaning and responsibility for me.',
          'Every design decision in OceanEye tries to respect science and reality as much as possible, but there are still many regrets and inaccuracies. If this project can spark even a little curiosity in you about these animals, the ocean, and nature, then this website has done what it was meant to do.” - Woody',
        ],
      },
      {
        title: 'Inspiration:',
        items: [
          'Product idea & name was inspired by Billie Eilish’s “Ocean Eyes,” while I was watching the movie — Hit Me Hard and Soft: The Tour.',
          'Blue Planet, BBC; natural-history illustration and scientific visual references.',
          [
            { text: '3DCellForge', href: 'https://github.com/huangserva/3DCellForge' },
            { text: ', as a technical/process reference for AI-assisted 3D model exploration, import, and review.' },
          ],
        ],
      },
      {
        title: 'Reference:',
        links: [
          { label: 'Wikipedia', href: 'https://www.wikipedia.org/' },
          { label: 'NOAA', href: 'https://www.noaa.gov/' },
          { label: 'WHOI', href: 'https://www.whoi.edu/' },
          { label: 'MBARI', href: 'https://www.mbari.org/' },
          { label: 'FishBase', href: 'https://www.fishbase.se/' },
          { label: 'Smithsonian Ocean', href: 'https://ocean.si.edu/' },
          { label: 'Australian Museum', href: 'https://australian.museum/' },
          { label: 'Florida Museum', href: 'https://www.floridamuseum.ufl.edu/' },
          { label: 'Monterey Bay Aquarium', href: 'https://www.montereybayaquarium.org/' },
          { label: 'Natural History Museum', href: 'https://www.nhm.ac.uk/' },
          { label: 'Oceana', href: 'https://oceana.org/' },
          { label: 'Oceanogràfic', href: 'https://www.oceanografic.org/en/' },
          { label: 'Frontiers', href: 'https://www.frontiersin.org/' },
          { label: 'ICES Journal', href: 'https://academic.oup.com/icesjms' },
          { label: 'Google Images', href: 'https://images.google.com/' },
          { label: 'AIDA International', href: 'https://aidainternational.org/' },
          { label: 'Guinness World Records', href: 'https://www.guinnessworldrecords.com/' },
        ],
      },
    ],
    quote: {
      title: 'Quote',
      body: '“The oceans, seemingly limitless,\n\ninvoke in us a sense of awe and wonder and also, sometimes, fear.\n\nThey cover 70% of the surface of our planet and yet they are still\n\nthe least explored.\n\nHidden beneath the waves,\n\nthere are creatures beyond our imagination...”\n\n- Blue Planet II, BBC',
    },
    personalLinks: {
      title: 'Contact me',
      links: [
        { label: 'woodydesign.io', href: 'https://woodydesign.io/' },
        { label: 'GitHub', href: 'https://github.com/woody-design' },
        { label: 'X.com', href: 'https://x.com/Woodylidesign' },
        { label: 'Substack', href: 'https://substack.com/@woodydesign' },
        { label: 'LinkedIn', href: 'https://www.linkedin.com/in/woodyli/' },
        { label: 'Email', href: 'mailto:woodystudio.io@gmail.com' },
      ],
    },
  },
  zh: {
    navLabel: '关于 OceanEye',
    railLabel: '相关链接',
    title: 'OceanEye',
    subtitle: '开源3D海洋生物图鉴',
    githubLink: {
      label: 'GitHub',
      href: 'https://github.com/woody-design/oceaneye',
    },
    credit: {
      ariaLabel: 'Designed by Woody & OC, CD, GG, HR, AC in NYC',
      parts: [
        { text: 'Designed by ' },
        { text: 'Woody', href: 'https://woodydesign.io/' },
        { text: ' & ' },
        { text: 'OC', href: 'https://openai.com/index/introducing-gpt-5-5/' },
        { text: ', ' },
        { text: 'CD', href: 'https://www.anthropic.com/news/claude-design-anthropic-labs' },
        { text: ', ' },
        { text: 'GG', href: 'https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-lite-preview' },
        { text: ', ' },
        { text: 'HR', href: 'https://hyper3d.ai/workspace/rodin' },
        { text: ', ' },
        { text: 'AC', href: 'https://www.anthropic.com/news/claude-opus-4-8' },
        { text: ' in NYC' },
      ],
    },
    sections: [
      {
        title: '编辑手记：',
        body: [
          '“这里所有的 3D 模型和视觉效果，本质上都只是对大自然的笨拙模仿。',
          '受限于当前 AI-assisted 3D 建模能力、web 性能和文件体积，很多细节还无法做到严谨符合科学。再加上编辑、校对和模型 review 都只有我一个人完成，虽然花了大约一周时间阅读和核对资料，内容里仍然有很多可改善的地方。',
          '最初做这个项目，是为了探索 AI vibe coding web app 的复杂度，为了探索未来教育和游戏的形态。同时也想看看自己一个人在几乎零 3D 建模，shader经验的情况下，能不能走通从资料、图像、模型、环境到网页体验的整个流程。但当我做出第一只模型，并开始认真阅读这些生物的结构和生存机制时，我深深被这些自然的奇迹所吸引和惊叹。这个项目也慢慢不再只是一个实验，而开始有了更多的意义和责任。',
          'OceanEye 的每一个设计决策都尽量尊重科学和现实，但它仍然充满着遗憾和不准确性。如果这个项目能激发起一点你对这些动物、对海洋、对自然的好奇心，那这就是这个网站的全部意义。” - Woody',
        ],
      },
      {
        title: '灵感：',
        items: [
          '产品概念启发自 Billie Eilish 的 “Ocean Eyes” 歌曲；在我看电影 Hit Me Hard and Soft: The Tour 的时候的灵感。',
          '蓝色星球系列, BBC；自然史插画和科学视觉参考。',
          [
            { text: '3DCellForge', href: 'https://github.com/huangserva/3DCellForge' },
            { text: '，作为 AI 辅助 3D 模型探索、导入和 review 的技术 / 流程参考。' },
          ],
        ],
      },
      {
        title: '参照：',
        links: [
          { label: 'Wikipedia', href: 'https://www.wikipedia.org/' },
          { label: 'NOAA', href: 'https://www.noaa.gov/' },
          { label: 'WHOI', href: 'https://www.whoi.edu/' },
          { label: 'MBARI', href: 'https://www.mbari.org/' },
          { label: 'FishBase', href: 'https://www.fishbase.se/' },
          { label: 'Smithsonian Ocean', href: 'https://ocean.si.edu/' },
          { label: 'Australian Museum', href: 'https://australian.museum/' },
          { label: 'Florida Museum', href: 'https://www.floridamuseum.ufl.edu/' },
          { label: 'Monterey Bay Aquarium', href: 'https://www.montereybayaquarium.org/' },
          { label: 'Natural History Museum', href: 'https://www.nhm.ac.uk/' },
          { label: 'Oceana', href: 'https://oceana.org/' },
          { label: 'Oceanogràfic', href: 'https://www.oceanografic.org/en/' },
          { label: 'Frontiers', href: 'https://www.frontiersin.org/' },
          { label: 'ICES Journal', href: 'https://academic.oup.com/icesjms' },
          { label: 'Google Images', href: 'https://images.google.com/' },
          { label: 'AIDA International', href: 'https://aidainternational.org/' },
          { label: 'Guinness World Records', href: 'https://www.guinnessworldrecords.com/' },
        ],
      },
    ],
    quote: {
      title: '引文',
      body: '“海洋，看似无边无尽，\n\n在唤醒我们的敬畏与惊奇的同时，也带来了恐惧。\n\n它覆盖了这颗星球 70% 的表面，然而它仍然是\n\n最少被探索过的地方。\n\n隐藏在深蓝海浪之下，\n\n有着种种超出人类想象力的生命……”\n\n-蓝色星球 II, BBC',
    },
    personalLinks: {
      title: '联系我',
      links: [
        { label: 'woodydesign.io', href: 'https://woodydesign.io/' },
        { label: 'GitHub', href: 'https://github.com/woody-design' },
        { label: 'X.com', href: 'https://x.com/Woodylidesign' },
        { label: 'Substack', href: 'https://substack.com/@woodydesign' },
        { label: 'LinkedIn', href: 'https://www.linkedin.com/in/woodyli/' },
        { label: 'Email', href: 'mailto:woodystudio.io@gmail.com' },
      ],
    },
  },
}

export function getEditorialContent(locale: Locale): EditorialContent {
  return editorialContent[locale]
}
