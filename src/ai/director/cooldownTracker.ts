// src/ai/director/cooldownTracker.ts
// Deterministic per-run cooldown tracking for the Live Adaptive Disaster Director.
// Prevents event spam, ensures reproducible playthroughs, and exposes telemetry for flight recording.

import type { DirectorEventId } from './directorTypes';

export class DirectorCooldownTracker {
  private lastTriggered: Map<DirectorEventId, number> = new Map();
  private cooldownDuration: Map<DirectorEventId, number> = new Map();

  /**
   * Resets all cooldowns for a fresh scenario playthrough.
   */
  public reset(): void {
    this.lastTriggered.clear();
    this.cooldownDuration.clear();
  }

  /**
   * Records that an event fired at a specific decision step with a specific cooldown window.
   */
  public recordTrigger(eventId: DirectorEventId, currentStep: number, cooldownNodes: number): void {
    this.lastTriggered.set(eventId, currentStep);
    this.cooldownDuration.set(eventId, cooldownNodes);
  }

  /**
   * Checks whether an event is currently on cooldown.
   * If currentStep - lastStep <= cooldownNodes, the event is blocked.
   */
  public isOnCooldown(eventId: DirectorEventId, currentStep: number): boolean {
    const lastStep = this.lastTriggered.get(eventId);
    if (lastStep === undefined) return false;

    const cooldown = this.cooldownDuration.get(eventId) ?? 2;
    return currentStep - lastStep <= cooldown;
  }

  /**
   * Returns how many decisions/steps remain before this event can trigger again.
   * Returns 0 if ready.
   */
  public getRemainingCooldown(eventId: DirectorEventId, currentStep: number): number {
    const lastStep = this.lastTriggered.get(eventId);
    if (lastStep === undefined) return 0;

    const cooldown = this.cooldownDuration.get(eventId) ?? 2;
    const elapsed = currentStep - lastStep;
    const remaining = cooldown - elapsed + 1;
    return remaining > 0 ? remaining : 0;
  }

  /**
   * Exports serializable active cooldown state for telemetry and RunInspector flight recording.
   */
  public getCooldownState(currentStep: number): Record<string, number> {
    const state: Record<string, number> = {};
    for (const [eventId] of this.lastTriggered) {
      const remaining = this.getRemainingCooldown(eventId, currentStep);
      if (remaining > 0) {
        state[eventId] = remaining;
      }
    }
    return state;
  }
}

/** Global singleton cooldown tracker for the live session */
export const directorCooldownTracker = new DirectorCooldownTracker();
