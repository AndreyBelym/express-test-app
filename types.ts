
export type TData = {
  recipients: TRecipient[];
  routes: TRoute[];
  providers: TProvider[];
  messages: TMessage[];
  tasks: TTaskGroup[];
};

export type TUser = {
  id: string;
  type: "user",
  routes: string[];
}

export type TGroup = {
  id: string;
  type: "group",
  members: string[]
}

export type TRecipient = TUser | TGroup;

export type TRoute = {
  id: string;
  address: string;
  provider: string;
};

export type TProvider = {
  id: string;
  name: string;
  type: string;
  options: any;
};

export type TMessage<T = any> = {
  payload: T;
  recipients: string[];
};

export type TTask<T = any> = {
  payload: T & { recipient?: string };
  address: string;
  provider: string;
};

export type TTaskGroup<T = any> = {
  type: string;
  tasks: TTask<T>[];
};