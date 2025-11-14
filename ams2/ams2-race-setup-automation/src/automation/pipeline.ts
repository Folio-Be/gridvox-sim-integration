import { AutomationPlan, RaceStoryRequest } from '../domain/raceDsl';
import { VisionLayoutParser } from './vision/visionLayoutParser';

export interface PipelineContext {
  story: RaceStoryRequest;
  layoutParser: VisionLayoutParser;
}

/**
 * High-level orchestrator for AMS2 automation runs.
 */
export class Ams2AutomationPipeline {
  public constructor(private readonly context: PipelineContext) {}

  public async plan(): Promise<AutomationPlan> {
    // Placeholder: convert story to deterministic plan
    const orderedActions = [
      { type: 'SetCar', carId: this.context.story.vehicle.model } as const,
      { type: 'SetTrack', trackId: this.context.story.track.id } as const,
    ];

    return {
      story: this.context.story,
      orderedActions,
    };
  }

  public async execute(plan: AutomationPlan) {
    for (const action of plan.orderedActions) {
      await this.context.layoutParser.refreshLayout();
      // TODO: feed action + layout into AutoHotkey executor
      // For now we just log to stdout so integration can be tested.
      console.log(`[automation] would execute action`, action);
    }
  }
}
