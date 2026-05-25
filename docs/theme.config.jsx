export default {
  logo: (
    <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>
      ⚡ Workit Docs
    </span>
  ),
  project: {
    link: 'https://github.com/your-org/workit-ecommerce',
  },
  docsRepositoryBase: 'https://github.com/your-org/workit-ecommerce/tree/main/docs',
  footer: {
    text: `Workit E-commerce Platform © ${new Date().getFullYear()}`,
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="Workit E-commerce Platform Documentation" />
      <title>Workit Docs</title>
    </>
  ),
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Workit Docs',
    }
  },
  sidebar: {
    defaultMenuCollapseLevel: 1,
    toggleButton: true,
  },
  toc: {
    backToTop: true,
  },
  editLink: {
    text: 'Edit this page on GitHub →',
  },
  feedback: {
    content: 'Question? Give us feedback →',
  },
  navigation: {
    prev: true,
    next: true,
  },
  darkMode: true,
  primaryHue: 210,
}
