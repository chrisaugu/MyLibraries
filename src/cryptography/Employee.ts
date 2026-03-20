import crypto from 'node:crypto';

// namespace pg.vodafone.com.core.employees;
// namespace pg.vodafone.com.core.customers;
// namespace pg.vodafone.com.core.locations;

// Come up with a overview diagram of all services/systems currently running
// Come up with a cannonical data model to interconnect all these services/systems

abstract class Account {
  protected accountId: string;

  constructor() {
    this.accountId = crypto.randomUUID();
  }
}

class Customer extends Account {
  private customerType: string;

  constructor() {
    super();
    this.customerType = 'business';
  }
}

export abstract class Employee extends Account {
  private EmployeeCode!: string;
  private FirstName!: string;
  private LastName!: string;
  private Position!: string;
  private Division!: 'Casual' | 'Permanent';
  private Department!: string;
  private Branch!: string;

  constructor(division_type: 'Casual' | 'Permanent') {
    super();
    this.Division = division_type;
  }
}

export class CasualEmployee extends Employee {
  constructor() {
    super('Casual');
  }
}

export class PermanentEmployee extends Employee {
  constructor() {
    super('Permanent');
  }
}
