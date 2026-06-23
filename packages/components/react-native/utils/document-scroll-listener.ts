/** Stub: no global scroll listener in React Native */
import { uuid } from './index';
export class DocumentScrollListener {
  static addCallback(_id: string, _cb: (e: any) => void): void {}
  static removeCallback(_id: string): void {}
  static getInstance(): DocumentScrollListener { return new DocumentScrollListener(); }
}
