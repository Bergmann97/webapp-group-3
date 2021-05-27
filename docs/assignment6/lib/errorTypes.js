/**
 * @fileOverview  Defines error export classes (also called "exception" export classes)
 * for property constraint violations
 * @author Gerd Wagner
 * @author Christian Prinz
 */

export class ConstraintViolation {
  constructor(msg) {
    /** @type {string} */
    this.message = msg;
  }
}

/** ## No Exception
 * Everything is fine.
 */
export class NoConstraintViolation extends ConstraintViolation {
  constructor(msg, v) {
    super(msg);
    if (v) this.checkedValue = v;
    this.message = "";
  }
}

/** ## Required Value Exception
 * require that a property must have a value. For instance, a person must have
 *  a name, so the name attribute must not be empty.
 */
export class MandatoryValueConstraintViolation extends ConstraintViolation {
  constructor(msg) {
    super(msg);
  }
}

/** ## Out of Range Exception
 * require that an attribute must have a value from the value space of the type
 * that has been defined as its range. For instance, an integer attribute must not have the value "aaa".
 */
export class RangeConstraintViolation extends ConstraintViolation {
  constructor(msg) {
    super(msg);
  }
}

/** ## String Length Exception
 * require that the length of a string value for an attribute is less than a
 * certain maximum number, or greater than a minimum number.
 */
export class StringLengthConstraintViolation extends ConstraintViolation {
  constructor(msg) {
    super(msg);
  }
}

/** ## Interval Exception
 * require that the value of a numeric attribute must be in a specific interval.
 */
export class IntervalConstraintViolation extends ConstraintViolation {
  constructor(msg) {
    super(msg);
  }
}

/** ## Pattern Exception
 * require that a string attribute's value must match a certain pattern
 * defined by a regular expression.
 */
export class PatternConstraintViolation extends ConstraintViolation {
  constructor(msg) {
    super(msg);
  }
}

/** ## Key-Constraint Exception
 * require that a property's value is unique among all instances
 * of the given object type.
 */
export class UniquenessConstraintViolation extends ConstraintViolation {
  constructor(msg) {
    super(msg);
  }
}

/** ## Referential Integrity Constraints
 * require that the values of a reference property refer to
 * an existing object in the range of the reference property.
 */
export class ReferentialIntegrityConstraintViolation extends ConstraintViolation {
  constructor(msg) {
    super(msg);
  }
}

/** ## Frozen Value Exception
 * require that the value of a property must not be changed after it has been
 * assigned initially.
 */
export class FrozenValueConstraintViolation extends ConstraintViolation {
  constructor(msg) {
    super(msg);
  }
}
