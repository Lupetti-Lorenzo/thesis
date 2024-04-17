import { PreTokenGenerationV2TriggerEvent } from "aws-lambda";
import { transient } from "../micro/inversify.decorators";

@transient(PreTokenGenerationHandler)
export class PreTokenGenerationHandler {
	constructor() {}

	public async handler(event: PreTokenGenerationV2TriggerEvent): Promise<PreTokenGenerationV2TriggerEvent> {
		// Get the user attributes from the event
		const userAttributes = event.request.userAttributes;
		// Get the 'user_id' from the user attributes
		const user_id = userAttributes["custom:user_id"];
		// Add 'user_id' and 'user_pool_id' to the access token claims
		event.response.claimsAndScopeOverrideDetails = {
			accessTokenGeneration: {
				claimsToAddOrOverride: {
					"custom:user_id": user_id,
				},
			},
		};
		// Return the modified event
		return event;
	}
}
