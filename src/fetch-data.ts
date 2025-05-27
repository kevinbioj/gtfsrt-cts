import dayjs from "dayjs";
import type { SiriLiteResponse } from "./types.js";

if (typeof process.env.API_TOKEN === "undefined") {
	throw new Error('Expected environment variable "API_TOKEN" to be defined.');
}

let cache: SiriLiteResponse;

const isCacheFresh = () => {
	if (typeof cache === "undefined") return false;
	return dayjs().isBefore(
		cache.ServiceDelivery.EstimatedTimetableDelivery[0].ValidUntil,
	);
};

export async function fetchData() {
	if (isCacheFresh()) return cache;

	const response = await fetch(
		"https://api.cts-strasbourg.eu/v1/siri/2.0/estimated-timetable?GetStopIdInsteadOfStopCode=true",
		{
			headers: {
				authorization: `Basic ${btoa(`${process.env.API_TOKEN}:`)}`,
			},
		},
	);

	if (!response.ok) {
		throw new Error(`Failed to fetch latest data (status ${response.status})`);
	}

	const payload = (await response.json()) as SiriLiteResponse;
	cache = payload;
	return payload;
}
