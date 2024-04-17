import {  User } from "../api/api.export";
import { users } from "../db/kysely_types";
import { singleton } from "../micro/inversify.decorators";
import { MicroDb } from "../micro/micro-db";
import { AppQueryFormatService } from "../services/app-query-format-service";

@singleton(UsersDao)
export class UsersDao {
	constructor(private db: MicroDb, private queryFormatter: AppQueryFormatService) {}

	public async getAll(
		limit: number = 25,
		offset: number = 0,
		sort: string[] = ["name:desc"],
		filter?: string[]
	): Promise<User[]> {
		// start query
		let query = this.db.kysely.selectFrom("users").selectAll();
		// add filter
		const where = this.queryFormatter.filterToKyselyWhere<"users">(filter || []);
		for (const { column, operator, value } of where) {
			query = query.where(column, operator, value); // combined in AND
		}
		// add sort, limit and offset
		const orderBy = this.queryFormatter.sortToKyselyOrderBy<"users", users>(sort);
		query = query.orderBy(orderBy).limit(limit).offset(offset);
		// execute query
		const users = await query.execute();
		return users.map((user) => {
			return {
				...user,
			};
		});
	}
 }