import NewsArticleCard from "@/components/NewsArticleCard";

export default function NewsExamplesPage() {
  const items = [
    { url: "https://www.bbc.com/news/articles/c0ml4j8erkeo" },
    {
      url: "https://www.reuters.com/world/china/china-cautions-tech-firms-over-nvidia-h20-ai-chip-purchases-sources-say-2025-08-12/",
    },
    {
      url: "https://apnews.com/article/1ce99a7089b33e88dc76e49945ded186",
    },
    {
      url: "https://www.theverge.com/ai-artificial-intelligence/757998/anthropic-just-made-its-latest-move-in-the-ai-coding-wars",
    },
    {
      url: "https://techcrunch.com/2025/08/11/nvidia-unveils-new-cosmos-world-models-other-infra-for-physical-applications-of-ai/",
    },
    {
      url: "https://arstechnica.com/tech-policy/2025/08/ai-industry-horrified-to-face-largest-copyright-class-action-ever-certified/",
    },
  ] as const;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">NewsArticleCard – demo</h1>
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
        A few live examples from multiple outlets. Click a row to expand; the
        title opens the article in a new tab.
      </p>

      <div className="space-y-4">
        {items.map((item) => (
          <NewsArticleCard key={item.url} {...item} />
        ))}
      </div>
    </main>
  );
}
