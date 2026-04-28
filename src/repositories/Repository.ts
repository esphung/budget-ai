import { DB } from '@op-engineering/op-sqlite';
import { TransformMapper } from '@repositories/TransformMapper';
import { ApiClient } from '@services/ApiClient';

type Local = {};
type Remote = {};

export class Repository {
	db: DB;
	api: ApiClient;
	mapper: TransformMapper<Local, Remote>;

	// The constructor is protected to prevent direct instantiation of the base Repository class
	constructor(
		db: DB,
		api: ApiClient,
		mapper: TransformMapper<Local, Remote>,
	) {
		this.db = db;
		this.api = api;
		this.mapper = mapper;
	}
}
