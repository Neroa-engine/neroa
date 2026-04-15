import { motion } from "framer-motion";
import type { ExampleBuildType, ExampleBuildTypeId } from "@/lib/marketing/example-build-data";

export function BuildTypeSelector({
  types,
  selectedTypeId,
  onSelect
}: {
  types: ExampleBuildType[];
  selectedTypeId: ExampleBuildTypeId | null;
  onSelect: (typeId: ExampleBuildTypeId) => void;
}) {
  return (
    <section className="floating-plane rounded-[34px] p-6 sm:p-8">
      <div className="floating-wash rounded-[34px]" />
      <div className="relative">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
              Step 1
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              What do you want to build?
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Start with the product type first so the rest of the simulation can follow the same
              structured system-planning order as the real Neroa build flow.
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200/70 bg-white/80 px-5 py-4 text-sm leading-7 text-slate-600">
            Choose the lane Neroa should use before industry, framework, and filtered examples appear.
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {types.map((type, index) => {
            const selected = selectedTypeId === type.id;

            return (
              <motion.button
                key={type.id}
                type="button"
                onClick={() => onSelect(type.id)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.34 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.985 }}
                className={`micro-glow relative rounded-[30px] border p-6 text-left transition ${
                  selected
                    ? "border-cyan-300/60 bg-[linear-gradient(145deg,rgba(239,248,255,0.98),rgba(255,255,255,0.84))] shadow-[0_22px_58px_rgba(34,211,238,0.16)]"
                    : "border-slate-200/70 bg-white/82"
                }`}
              >
                <div className="absolute inset-0 rounded-[30px] bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.12),transparent_30%)]" />
                <div className="relative">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,rgba(34,211,238,0.9),rgba(59,130,246,0.9)_52%,rgba(139,92,246,0.88))] text-sm font-semibold tracking-[0.16em] text-white shadow-[0_14px_32px_rgba(59,130,246,0.24)]">
                      {type.marker}
                    </span>
                    {selected ? (
                      <span className="premium-pill border-cyan-300/24 bg-cyan-300/12 text-cyan-700">
                        Selected
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
                    {type.label}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{type.description}</p>
                  <p className="mt-5 border-t border-slate-200/70 pt-4 text-sm leading-7 text-slate-500">
                    {type.selectorHint}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
