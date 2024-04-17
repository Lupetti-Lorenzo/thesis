import { APIGatewayAuthorizerResult, PolicyDocument, APIGatewayTokenAuthorizerEvent } from "aws-lambda";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { CognitoAccessTokenPayload } from "aws-jwt-verify/jwt-model";
import { transient } from "../micro/inversify.decorators";
import { MicroEnv } from "../micro/micro-env";

@transient(AuthorizerHandler)
export class AuthorizerHandler {
	constructor(private env: MicroEnv) {}
	public async handler(event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> {
		const authHeader = event.authorizationToken || "";
		const token = authHeader.split(" ")[1];
		const methodArn = event.methodArn || "";

		if (!methodArn) {
			return generateAuthResponse("anonymous", "Deny", methodArn, {
				message: "Endpoint not defined, check method and path to be correct",
				statusCode: 400,
				responseType: "BAD_REQUEST",
			});
		}
		if (!token) {
			throw new Error("Unauthorized"); // 401
		}

		// the package verifies the token - access token
		const verifier = CognitoJwtVerifier.create({
			userPoolId: process.env.USER_POOL_ID!,
			tokenUse: "access",
			clientId: process.env.USER_POOL_CLIENT_ID,
		});

		// extract payload from token while verifying
		let payload: CognitoAccessTokenPayload;
		try {
			payload = await verifier.verify(token, {
				clientId: process.env.USER_POOL_CLIENT_ID!,
			});
			
			// add groups and id as context
			const userGroups = payload["cognito:groups"] || [];
			const user_id = payload["custom:user_id"] || "";
                // return allow policy document
                return generateAuthResponse(payload.sub, "Allow",             event.methodArn, {
                        groups: userGroups.join(", "),
                        user_id: user_id,
        	});
		} catch {
			throw new Error("Unauthorized"); // 401 
		}
	}
}

function generateAuthResponse(
	principalId: string,
	effect: string,
	methodArn: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	context?: any
): APIGatewayAuthorizerResult {
	const policyDocument = generatePolicyDocument(effect, methodArn);
	return {
		principalId,
		policyDocument,
		context,
	} as APIGatewayAuthorizerResult;
}

function generatePolicyDocument(effect: string, methodArn: string): PolicyDocument {
	const policyDocument = {} as PolicyDocument;
	if (!effect || !methodArn) return policyDocument;
	policyDocument.Version = "2012-10-17";
	policyDocument.Statement = [];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const statementOne: any = {};
	statementOne.Action = "execute-api:Invoke";
	statementOne.Effect = effect;
	statementOne.Resource = methodArn;
	policyDocument.Statement[0] = statementOne;
	return policyDocument;
}
