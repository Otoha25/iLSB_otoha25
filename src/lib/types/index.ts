type Id = string;

export type Meta = {
	username: string;
	root_qkey_id: Qkey["id"];
	start_date: number;
	end_date?: number; //使用しないが，念のため．
};

export type Qkey = {
	id: Id;
	parent_id: Qkey["id"] | null;
	segkey_id: Segkey["id"] | null;
	title: string;
	node_x: number;
	node_y: number;
	qtype_name: string | null;
};

export type Qlink = {
	id: Id;
	parent_qkey_id: Qkey["id"];
	child_qkey_id: Qkey["id"];
	property_name: string | null;
};

export type Segkey = {
	id: Id;
	belonged_qkey_id: Qkey["id"];
	parent_id: Segkey["id"] | null;
	title: string;
	source_url: string;
};
