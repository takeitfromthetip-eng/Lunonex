// soundForge.ts
import * as Tone from 'tone';

export interface CreateTrackOptions {
  bpm?: number;
  instruments?: string[];
  fx?: Array<{ type: string; options?: any }>;
}

export async function createTrack({ bpm = 120, instruments = ['synth'], fx = [] }: CreateTrackOptions) {
  await Tone.start();
  Tone.Transport.bpm.value = bpm;

  const track = instruments.map(inst => {
    // You can expand this switch for more instrument types
    let synth: Tone.Synth | Tone.PolySynth = new Tone.Synth().toDestination();
    if (inst === 'poly') synth = new Tone.PolySynth().toDestination();
    return { synth, pattern: [] };
  });

  fx.forEach(effect => {
    // @ts-ignore
    const fxNode = new (Tone as any)[effect.type](effect.options).toDestination();
    track.forEach(t => t.synth.connect(fxNode));
  });

  return track;
}
