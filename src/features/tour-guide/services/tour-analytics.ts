import type { TourGuideAnalyticsEvent } from "@/features/tour-guide/types"

export interface TourAnalyticsClient {
  log: (event: TourGuideAnalyticsEvent) => void
}

export const consoleTourAnalyticsClient: TourAnalyticsClient = {
  log: (event) => {
    if (typeof console === "undefined") {
      return
    }

    const label = `[tour-analytics] ${event.type}`
    console.info(label, {
      stepId: event.stepId,
      timestamp: event.timestamp,
      metadata: event.metadata,
    })
  },
}

export function logTourEvent(
  event: TourGuideAnalyticsEvent,
  client: TourAnalyticsClient = consoleTourAnalyticsClient,
) {
  client.log(event)
}
