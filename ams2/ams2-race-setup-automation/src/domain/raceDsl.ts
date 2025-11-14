export interface RaceStoryRequest {
  storyId: string;
  title: string;
  vehicle: {
    class: string;
    model: string;
    livery?: string;
  };
  track: {
    id: string;
    layout?: string;
  };
  session: {
    type: 'race' | 'qualifying' | 'practice';
    laps?: number;
    durationMinutes?: number;
    startTime: string;
    timeProgression: number;
  };
  weather: Array<{ slot: number; preset: string }>;
  aiOpponents: {
    gridSize: number;
    difficulty: number;
  };
}

export type RaceAction =
  | { type: 'SetCar'; carId: string; liveryId?: string }
  | { type: 'SetTrack'; trackId: string; layoutId?: string }
  | { type: 'SetWeather'; slot: number; preset: string }
  | { type: 'SetSession'; field: 'laps' | 'duration' | 'time'; value: number | string }
  | { type: 'SetOpponents'; gridSize: number; difficulty: number };

export interface AutomationPlan {
  story: RaceStoryRequest;
  orderedActions: RaceAction[];
}
