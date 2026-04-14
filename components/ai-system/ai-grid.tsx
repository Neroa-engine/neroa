import { AiCard } from "@/components/ai-system/ai-card";
import { aiSystemCards } from "@/lib/data/ai-system";

type AiGridProps = {
  featuredId?: (typeof aiSystemCards)[number]["id"];
  className?: string;
};

export function AiGrid({ featuredId = "narua", className = "" }: AiGridProps) {
  const featured = aiSystemCards.find((card) => card.id === featuredId) ?? aiSystemCards[0];
  const remaining = aiSystemCards.filter((card) => card.id !== featured.id);

  return (
    <div className={`grid gap-4 lg:grid-cols-2 ${className}`}>
      <AiCard
        id={featured.id}
        description={featured.description}
        href={`/system/${featured.slug}`}
        featured
      />

      {remaining.map((card) => (
        <AiCard
          key={card.id}
          id={card.id}
          description={card.description}
          href={`/system/${card.slug}`}
        />
      ))}
    </div>
  );
}
