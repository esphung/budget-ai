import { AccountRepository } from '@repositories/AccountRepository';
import { Account } from 'types/Account';

export class EnsureDefaultAccount {
	constructor(private accountRepo: AccountRepository) {}

	execute(): Promise<Account> {
		return this.accountRepo.ensureDefaultAccount();
	}
}
