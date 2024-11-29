export type SiriLiteResponse = {
	ServiceDelivery: ServiceDelivery;
};

export type ServiceDelivery = {
	ResponseTimestamp: string;
	RequestMessageRef: string | null;
	EstimatedTimetableDelivery: [EstimatedTimetableDelivery];
};

export type EstimatedTimetableDelivery = {
	version: "2.0";
	ResponseTimestamp: string;
	ValidUntil: string;
	ShortestPossibleCycle: string;
	EstimatedJourneyVersionFrame: EstimatedJourneyVersionFrame[];
};

export type EstimatedJourneyVersionFrame = {
	RecordedAtTime: string;
	EstimatedVehicleJourney: [EstimatedVehicleJourney];
};

export type EstimatedVehicleJourney = {
	LineRef: string;
	DirectionRef: number;
	FramedVehicleJourneyRef: {
		DatedVehicleJourneySAERef: string;
	};
	PublishedLineName: string;
	IsCompleteStopSequence: boolean;
	EstimatedCalls: EstimatedCall[];
	Extension: {
		VehicleMode: "bus" | "tram";
	};
};

export type EstimatedCall = {
	StopPointRef: string;
	StopPointName: string;
	DestinationName: string;
	DestinationShortName: string;
	Via: null;
	ExpectedDepartureTime: string | null;
	ExpectedArrivalTime: string | null;
	Extension: {
		IsRealTime: boolean;
		IsCheckOut: boolean;
	};
};
