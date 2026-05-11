import { MDXProvider } from "@mdx-js/react";
import type { ReactNode } from "react";
import { Callout } from "./Callout";
import { Sidenote } from "./Sidenote";
import { Sources } from "./Sources";
import { ComparisonTable } from "./ComparisonTable";

const components = {
  Callout,
  Sidenote,
  Sources,
  ComparisonTable,
};

interface MdxComponentsProviderProps {
  children: ReactNode;
}

export function MdxComponentsProvider({ children }: MdxComponentsProviderProps) {
  return <MDXProvider components={components}>{children}</MDXProvider>;
}
