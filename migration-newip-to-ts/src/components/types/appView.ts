import { IData } from '../types/data';
import { ISources } from '../types/sources';


type StatusType = 'ok'|'error';
  
  
  export interface IAppView {
    articles?: IData[];
    sources?: ISources[];
    status: StatusType;
    totalResults: number;
    code?: string;
    message?: string; 
  }