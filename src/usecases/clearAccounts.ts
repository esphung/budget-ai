import { AccountRepository } from '@repositories/AccountRepository';

export class ClearAccounts {
	constructor(private accountRepo: AccountRepository) {}

	execute(): Promise<void> {
		return this.accountRepo.clearAll();
	}
}
