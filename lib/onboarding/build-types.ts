export type BuildCategoryId =
  | "saas"
  | "internal-software"
  | "external-app"
  | "mobile-app";

export type BuildTemplateFeature = {
  id: string;
  label: string;
  whatItDoes: string;
  whyIncluded: string;
  stage: "MVP" | "Later";
};
