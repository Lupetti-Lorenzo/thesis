type authorizeUserProps = {
	pathGroups: string[];
	pathUserId?: string;
};

@transient(AppContextService)
export class AppContextService {
	constructor(private scope: MicroExecutionScope, private env: MicroEnv) {}
    
	public authorizeUserOrThrow(props: authorizeUserProps): string {
		const userGroups = this.getGroups();
		for (const group of [CognitoGroups.ADMIN, ...props.pathGroups]) {
			if (userGroups.includes(group)) {
				if (
					group === CognitoGroups.TEAM_MEMBER &&
					props.pathUserId &&
					props.pathUserId !== this.getCallerUserId()
				)
					continue;
				// else return, authorized
				return group;
			}
		}
		throw new ForbiddenException(`Unauthorized to access this resource`);
	}

	public getGroups(): string[] {
		const event = this.scope.event as APIGatewayProxyEventBase<APIGatewayProxyCognitoAuthorizerContext>;
		return (event?.requestContext?.authorizer?.groups ?? "").split(", ");
	}

	public getCallerUserId(): string {
		const event = this.scope.event as APIGatewayProxyEventBase<APIGatewayProxyCognitoAuthorizerContext>;
		return event?.requestContext?.authorizer?.user_id ?? "";
	}
}