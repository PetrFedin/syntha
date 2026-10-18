export class OrganisationUnavailable extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrganisationUnavailable';
  }
}

export class MembershipAlreadyExists extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MembershipAlreadyExists';
  }
}

export class MembershipNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MembershipNotFound';
  }
}
