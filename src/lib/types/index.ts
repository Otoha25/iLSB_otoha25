export type Header = {
  username: string;
  root_quekey_id: string;
}

export type Quekey = {
  id: string;
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
  id: string;
  parent_quekey_id: Quekey["id"];
  child_quekey_id: Quekey["id"];
  
  attribution_id: string;
};

export type Segkey = {
  id: string;
  belonged_qkey_id: string;
  parent_id: string;
  title: string;
  source_url: string;
}
