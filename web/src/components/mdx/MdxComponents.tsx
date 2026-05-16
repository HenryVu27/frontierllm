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
import TensorParallelMatmul from "./figures/TensorParallelMatmul";
import ZeroStages from "./figures/ZeroStages";
import DeviceMesh from "./figures/DeviceMesh";
import PipelineSchedule from "./figures/PipelineSchedule";
import ExpertParallelRouting from "./figures/ExpertParallelRouting";
import CommComputeOverlap from "./figures/CommComputeOverlap";
import RecomputeMemory from "./figures/RecomputeMemory";
import KvCacheLayout from "./figures/KvCacheLayout";
import DecodingStrategies from "./figures/DecodingStrategies";
import SpeculativeDecodingTimeline from "./figures/SpeculativeDecodingTimeline";
import RlhfPpoLoop from "./figures/RlhfPpoLoop";
import DpoLossGeometry from "./figures/DpoLossGeometry";
import SaeSparsityTradeoff from "./figures/SaeSparsityTradeoff";
import LabReleaseTimeline from "./figures/LabReleaseTimeline";
import MuPTransfer from "./figures/MuPTransfer";
import LossSpikeRecovery from "./figures/LossSpikeRecovery";
import OptimizerTrajectory from "./figures/OptimizerTrajectory";
import ActivationStats from "./figures/ActivationStats";
import DataMixStack from "./figures/DataMixStack";

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
  TensorParallelMatmul,
  ZeroStages,
  DeviceMesh,
  PipelineSchedule,
  ExpertParallelRouting,
  CommComputeOverlap,
  RecomputeMemory,
  KvCacheLayout,
  DecodingStrategies,
  SpeculativeDecodingTimeline,
  RlhfPpoLoop,
  DpoLossGeometry,
  SaeSparsityTradeoff,
  LabReleaseTimeline,
  MuPTransfer,
  LossSpikeRecovery,
  OptimizerTrajectory,
  ActivationStats,
  DataMixStack,
};

interface MdxComponentsProviderProps {
  children: ReactNode;
}

export function MdxComponentsProvider({ children }: MdxComponentsProviderProps) {
  return <MDXProvider components={components}>{children}</MDXProvider>;
}
