import { GetAllUsersHandlerInterface, ApiResponse, GetAllUsersQuery, User } from "../api/api.export";
import { transient } from "../micro/inversify.decorators";
import { AppContextService } from "../services/app-context-service";
import { UsersDao } from "../dao/UsersDao";
import { CognitoGroups } from "../services/app-cognito-users-service";

@transient(GetAllUsersHandler)
export class GetAllUsersHandler implements GetAllUsersHandlerInterface {
	constructor(private contextService: AppContextService, private usersDao: UsersDao) {}

	public async GetAllUsers(query: GetAllUsersQuery): Promise<ApiResponse<User[]>> {
		this.contextService.authorizeUserOrThrow({ pathGroups: [CognitoGroups.HR] });

		const users = await this.usersDao.getAll(query?.limit, query?.offset, query?.sort, query?.filter);
		return {
			statusCode: 200,
			body: users,
		};
	}
}