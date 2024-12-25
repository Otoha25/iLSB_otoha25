export type Id = `${string}-${string}-${string}-${string}-${string}`;

export type Header = {
	username: string;
	root_quekey_id: Quekey["id"];

	start_date: Date;
	end_date: Date; //使用しないが，念のため．
};

export type Quekey = {
	id: Id;
	parent_id: Quekey["id"];
	segkey_id: Segkey["id"];
	title: string;

	node_x: number;
	node_y: number;
	node_width: number;
	node_height: number;

	qtype_id: string;
};

export type Quelink = {
	id: Id;
	parent_quekey_id: Quekey["id"];
	child_quekey_id: Quekey["id"];

	attribution_id: string;
};

export type Segkey = {
	id: Id;
	belonged_qkey_id: string;
	parent_id: string;
	title: string;
	source_url: string;
};
