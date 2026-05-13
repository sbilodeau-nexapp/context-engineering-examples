export abstract class GetAlertService {
  public abstract addLog(
    severity: SeverityLevel,
    entry: AlertEntry,
    error: Error | string,
  );
}

export interface AlertEntry {
  body: unknown;
  origin: string;
  action: string;
}

export type SeverityLevel =
  | 'fatal'
  | 'error'
  | 'warning'
  | 'log'
  | 'info'
  | 'debug';
