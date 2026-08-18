import { setTimeout } from "node:timers/promises";
import { serve } from "@hono/node-server";
import GtfsRealtime from "gtfs-realtime-bindings";
import { Hono } from "hono";
import { rateLimiter } from "hono-rate-limiter";

import { PORT, REFRESH_INTERVAL } from "./config.js";
import { handleRequest } from "./gtfs-rt/handle-request.js";
import { useRealtimeStore } from "./gtfs-rt/use-realtime-store.js";
import { fetchEstimatedTimetable } from "./siri-lite/estimated-timetable.js";

console.log(` ,----.,--------.,------.,---.        ,------.,--------.  ,-----.,--------.,---.   
'  .-./'--.  .--'|  .---'   .-',-----.|  .--. '--.  .--' '  .--./'--.  .--'   .-'  
|  | .---.|  |   |  \`--,\`.  \`-.'-----'|  '--'.'  |  |    |  |       |  |  \`.  \`-.  
'  '--'  ||  |   |  |\`  .-'    |      |  |\\  \\   |  |    '  '--'\\   |  |  .-'    | 
 \`------' \`--'   \`--'   \`-----'       \`--' '--'  \`--'     \`-----'   \`--'  \`-----'`);

const store = useRealtimeStore();

const hono = new Hono();
hono.use(
	rateLimiter({
		windowMs: 5_000,
		limit: 5,
		keyGenerator: (c) => `${c.req.header("CF-Connecting-IP")}_${c.req.method}_${c.req.path}`,
		handler: (c) => c.json({ code: 429, message: "Too many requests, please try again later." }, 429),
	}),
);
hono.get("/trip-updates", (c) => handleRequest(c, "protobuf", store.tripUpdates, null));
hono.get("/trip-updates.json", (c) => handleRequest(c, "json", store.tripUpdates, null));
hono.get("/vehicle-positions", (c) => handleRequest(c, "protobuf", null, store.vehiclePositions));
hono.get("/vehicle-positions.json", (c) => handleRequest(c, "json", null, store.vehiclePositions));
hono.get("/", (c) =>
	handleRequest(c, c.req.query("format") === "json" ? "json" : "protobuf", store.tripUpdates, store.vehiclePositions),
);
serve({ fetch: hono.fetch, port: PORT });
console.log(`|> Listening on :${PORT}`);

while (true) {
	console.log("|> Updating entities");

	const startedAt = Date.now();
	let error: unknown | undefined;

	let tripUpdatesCount = 0;

	try {
		const response = await fetchEstimatedTimetable();

		const [delivery] = response.ServiceDelivery.EstimatedTimetableDelivery;

		for (const frame of delivery.EstimatedJourneyVersionFrame) {
			const recordedAt = Math.floor(Temporal.Instant.from(frame.RecordedAtTime).epochMilliseconds / 1000);

			for (const journey of frame.EstimatedVehicleJourney) {
				const tripId = journey.FramedVehicleJourneyRef.DatedVehicleJourneySAERef;

				tripUpdatesCount += 1;
				store.tripUpdates.set(`ET:${tripId}`, {
					stopTimeUpdate: journey.EstimatedCalls.map(
						({ StopPointRef, ExpectedArrivalTime, ExpectedDepartureTime }) => ({
							arrival: ExpectedArrivalTime
								? { time: Math.floor(Temporal.Instant.from(ExpectedArrivalTime).epochMilliseconds / 1000) }
								: undefined,
							departure: ExpectedDepartureTime
								? { time: Math.floor(Temporal.Instant.from(ExpectedDepartureTime).epochMilliseconds / 1000) }
								: undefined,
							stopId: StopPointRef,
							scheduleRelationship:
								GtfsRealtime.transit_realtime.TripUpdate.StopTimeUpdate.ScheduleRelationship.SCHEDULED,
						}),
					),
					timestamp: recordedAt,
					trip: {
						tripId,
						scheduleRelationship: GtfsRealtime.transit_realtime.TripDescriptor.ScheduleRelationship.SCHEDULED,
					},
				});
			}
		}
	} catch (cause) {
		error = cause;
	} finally {
		const duration = Date.now() - startedAt;
		const waitingTime = REFRESH_INTERVAL - duration;

		if (error === undefined) {
			console.log(`✓ Done updating ${tripUpdatesCount} trip updates in ${duration}ms, waiting for ${waitingTime}ms.`);
		} else {
			console.error(`✘ Unable to update entities, retrying in ${waitingTime}ms.`, error);
		}

		await setTimeout(waitingTime);
	}
}
