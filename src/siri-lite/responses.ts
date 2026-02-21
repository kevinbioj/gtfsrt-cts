export type Siri<T> = {
	ServiceDelivery: {
		ResponseTimestamp: string;
	} & T;
};

export type EstimatedTimetableResponse = {
	EstimatedTimetableDelivery: [
		{
			EstimatedJourneyVersionFrame: Array<{
				RecordedAtTime: string;
				EstimatedVehicleJourney: Array<{
					LineRef: string;
					DirectionRef: number;
					FramedVehicleJourneyRef: {
						DatedVehicleJourneySAERef: string;
					};
					PublishedLineName: string;
					IsCompleteStopSequence: boolean;
					EstimatedCalls: Array<{
						StopPointRef: string;
						StopPointName: string;
						DestinationName: string;
						DestinationShortName: string;
						ExpectedDepartureTime: string | null;
						ExpectedArrivalTime: string | null;
						Extension: {
							IsRealTime: boolean;
							IsCheckOut: boolean;
						};
					}>;
					Extension: {
						VehicleMode: "bus" | "tram";
					};
				}>;
			}>;
		},
	];
};

export type VehicleMonitoringResponse = {
	VehicleMonitoringDelivery: Array<{
		VehicleActivity: Array<{
			ValidUntilTime: string;
			VehicleMonitoringRef: {
				value: string;
			};
			MonitoredVehicleJourney: {
				LineRef: {
					value: string;
				};
				DirectionRef: {
					value: "inbound" | "outbound";
				};
				FramedVehicleJourneyRef: {
					DataFrameRef: {
						value: string;
					};
					DatedVehicleJourneyRef: string;
				};
				VehicleLocation: {
					Longitude: number;
					Latitude: number;
				};
				Occupancy?: string;
				Bearing: number;
				VehicleRef: {
					value: string;
				};
				Delay: string;
				MonitoredCall: {
					AimedDepartureTime: string;
					StopPointRef: {
						value: string;
					};
					Order: number;
				};
			};
			RecordedAtTime: string;
		}>;
	}>;
};
