/** Stub: no global click listener in React Native */
import { uuid } from './index';
export class DocumentClickListener {
  static addCallback(_id: string, _cb: (e: any) => void): void {}
  static removeCallback(_id: string): void {}
  static getInstance(): DocumentClickListener { return new DocumentClickListener(); }
}
