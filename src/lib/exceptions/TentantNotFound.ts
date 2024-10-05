export class TentantNotFoundException extends Error {
	constructor(message: string = "Tenant does not exist") {
		super(message);
		this.name = "NoTenantException";
		Object.setPrototypeOf(this, TentantNotFoundException.prototype);
	}
}
