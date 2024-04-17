it("GetAllUsers", async () => {
	const container = await GenerateApiRequestContainer();
	const handler = container.resolve(GetAllUsersHandler);
	const result = await handler.GetAllUsers({
		limit: 25,
		offset: 0,
		sort: ["name:desc", "surname:ASC"],
		filter: ["name:eq:Mario"],
	});
	expect(result).toBeDefined();
	expect(result.body).toBeDefined();
	expect(result.body.length).toBeGreaterThan(0);
	expect(result.statusCode).toBe(200);
});