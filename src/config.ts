if (process.env.API_TOKEN === undefined) {
	throw new Error("Environment variable 'API_TOKEN' must be set!");
}

export const PORT = +(process.env.PORT ?? 3000);
export const REFRESH_INTERVAL = Temporal.Duration.from({ seconds: 30 }).total("milliseconds");
export const SIRI_LITE_API_KEY = btoa(`${process.env.API_TOKEN}:`);
export const SIRI_LITE_API_URL = "https://api.cts-strasbourg.eu/v1/siri/2.0";
export const SWEEP_THRESHOLD = Temporal.Duration.from({ minutes: 10 }).total("milliseconds");
