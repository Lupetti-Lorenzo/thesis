const defaultGroups = ["team-member", "skills-user"];
const userToGroupsMap = { ... }
@transient(SignInPostConfirmationHandler)
export class SignInPostConfirmationHandler {
	constructor(private usersDao: UsersDao, private cognitoGroupsService: AppCognitoGroupsService) {}

	public async handler(
		event: PostConfirmationConfirmSignUpTriggerEvent
	): Promise<PostConfirmationConfirmSignUpTriggerEvent> {
		// extract user data from event
		const { userName } = event;
		const { email, family_name, given_name, picture } = event.request.userAttributes;
		// initialize userData with default values
		let userData: UserCreate = {
			email: email,
			name: given_name,
			surname: family_name,
			profile_picture: picture,
			cognito_username: userName,
		};
    // get groups defined and if not default 
            const userGroups = usersToGroupsMap[email] || defaultGroups;
    // update userData with groups
		userData = {
			...userData,
			...userGroups.reduce((acc, group) => ({ ...acc, [group]: true }), {}),
		};
		// Add the user to group(s) in aws cognito
		await this.cognitoGroupsService.addGroupsToUser(userName, userGroups);
    // create user in database
		const userCreated = await this.usersDao.create(userData);
		// add user id to user pool attributes
		const attributes: AttributeType[] = [
			{
				Name: "custom:user_id",
				Value: userCreated.id,
			},
		];
		await this.cognitoGroupsService.addAttributesToUser(userName, attributes);

		return event;
	}
}