import { MDXProvider } from "@mdx-js/react";
import type { ReactNode } from "react";
import { Callout } from "./Callout";
import { Sidenote } from "./Sidenote";
import { Sources } from "./Sources";
import { ComparisonTable } from "./ComparisonTable";
import { Figure } from "./Figure";
import TransformerBlock from "./figures/TransformerBlock";
import AttentionVariantsDiagram from "./figures/AttentionVariantsDiagram";
import MoeRoutingDiagram from "./figures/MoeRoutingDiagram";
import DataPipelineFlow from "./figures/DataPipelineFlow";
import LongContextStaging from "./figures/LongContextStaging";
import RopeRotation from "./figures/RopeRotation";
import ActivationCurves from "./figures/ActivationCurves";
import ScheduleOverlay from "./figures/ScheduleOverlay";
import IsoflopCurve from "./figures/IsoflopCurve";

const components = {
  Callout,
  Sidenote,
  Sources,
  ComparisonTable,
  Figure,
  TransformerBlock,
  AttentionVariantsDiagram,
  MoeRoutingDiagram,
  DataPipelineFlow,
  LongContextStaging,
  RopeRotation,
  ActivationCurves,
  ScheduleOverlay,
  IsoflopCurve,
};

interface MdxComponentsProviderProps {
  children: ReactNode;
}

export function MdxComponentsProvider({ children }: MdxComponentsProviderProps) {
  return <MDXProvider components={components}>{children}</MDXProvider>;
}
