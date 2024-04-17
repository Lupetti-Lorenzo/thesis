import { singleton } from "./inversify.decorators";
import { MicroConfig } from "./micro-config";
import { Pool } from "pg";
import { DB } from "../db/kysely_types";
import { Kysely, PostgresDialect } from "kysely";


@singleton(MicroDb)
export class MicroDb {
	private _pool: Pool;
	private _kysely: Kysely<DB>;
    
	public get pool() {
		return this._pool;
	}
	public get kysely() {
		return this._kysely;
	}
 
	constructor(private config: MicroConfig) {
    // get credentials
		let credentials = { ...local_credentials }; 
		if (process.env.APP_ENV !== "local") { 
			const secretName = process.env.DB_SECRET_NAME!;
			const { password, username, dbname, port, host } = config.getSecret<DBCredentials>(secretName);
			const dbHost = process.env.DB_HOST || host;
			credentials = { host: dbHost, username, password, dbname, port };
		}
		// connect to the database
		this._pool = new Pool({
			...credentials,
			user: credentials.username,
			database: credentials.dbname,
		});
		// initialize kysely
		const dialect = new PostgresDialect({ pool: this.pool });
		this._kysely = new Kysely<DB>({ dialect });
	}
}