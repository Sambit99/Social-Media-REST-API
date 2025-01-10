export type HttpResponse = {
  success: boolean;
  status: number;
  request: {
    ip?: string | null;
    method?: string | null;
    url?: string | null;
  };
  message: string;
  data: unknown;
};

export type HttpError = {
  success: boolean;
  status: number;
  request: {
    ip?: string | null;
    method?: string | null;
    url?: string | null;
  };
  message: string;
  data: unknown;
  trace?: object | null;
};
