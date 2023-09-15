import { DateTime } from 'luxon';

declare module 'luxon' {
  interface DateTime {
    toISOString(): string;
  }
}
// eslint-disable-next-line fp/no-mutation, func-names
DateTime.prototype.toISOString = function () {
  return this.toJSDate().toISOString();
};

export { DateTime };
