import { ModelPlan } from './modelPlanner';

export type AutomationMode = 'idle' | 'story-selection' | 'race-setup';

export interface ModeTransition {
  from: AutomationMode;
  to: AutomationMode;
  timestamp: number;
  unloadServices: string[];
  loadServices: string[];
}

/**
 * Tracks when to swap STT/TTS and VLM workloads.
 * For now this simply returns the intent log the desktop app could follow.
 */
export class AutomationModeManager {
  private currentMode: AutomationMode = 'idle';
  constructor(private readonly plan: ModelPlan) {}

  public transition(to: AutomationMode): ModeTransition {
    const transition: ModeTransition = {
      from: this.currentMode,
      to,
      timestamp: Date.now(),
      unloadServices: [],
      loadServices: [],
    };

    if (to === 'race-setup') {
      transition.unloadServices = this.servicesOfKind(['stt', 'tts']);
      transition.loadServices = this.servicesOfKind(['vision']);
    } else if (this.currentMode === 'race-setup' && to === 'idle') {
      transition.unloadServices = this.servicesOfKind(['vision']);
      transition.loadServices = this.servicesOfKind(['stt', 'tts']);
    }

    this.currentMode = to;
    return transition;
  }

  private servicesOfKind(kinds: Array<'vision' | 'stt' | 'tts'>): string[] {
    return this.plan.selectedModels
      .filter((model) => kinds.includes(model.kind as 'vision' | 'stt' | 'tts'))
      .map((model) => model.id);
  }
}
