import { apiClient } from '@services/ApiClient';
import { useCallback, useState } from 'react';
import {
	create,
	LinkAccount,
	LinkExit,
	LinkSuccess,
	LinkTokenConfiguration,
	open,
} from 'react-native-plaid-link-sdk';

const TOKEN_MAX_AGE_MS = 25 * 60 * 1000;

interface UsePlaidLinkOptions {
	onLinkedAccounts?: (accounts: LinkAccount[]) => void;
	onExit?: (linkExit: LinkExit) => void;
}

interface UsePlaidLinkResult {
	hasLinkToken: boolean;
	isStarting: boolean;
	startPlaidLink: () => Promise<void>;
	refreshLinkToken: () => Promise<void>;
	clearLinkToken: () => void;
}

export function usePlaidLink(
	options: UsePlaidLinkOptions = {},
): UsePlaidLinkResult {
	const [linkToken, setLinkToken] = useState<string | null>(null);
	const [tokenFetchedAt, setTokenFetchedAt] = useState<number | null>(
		null,
	);
	const [isStarting, setIsStarting] = useState(false);

	const clearLinkToken = useCallback(() => {
		setLinkToken(null);
		setTokenFetchedAt(null);
	}, []);

	const fetchLinkToken = useCallback(async () => {
		const result = await apiClient.plaid.getLinkToken();
		setLinkToken(result.link_token ?? null);
		setTokenFetchedAt(Date.now());
		return result.link_token ?? null;
	}, []);

	const isTokenFresh = useCallback(() => {
		if (!linkToken || !tokenFetchedAt) {
			return false;
		}
		return Date.now() - tokenFetchedAt < TOKEN_MAX_AGE_MS;
	}, [linkToken, tokenFetchedAt]);

	const refreshLinkToken = useCallback(async () => {
		await fetchLinkToken();
	}, [fetchLinkToken]);

	const startPlaidLink = useCallback(async () => {
		if (isStarting) {
			return;
		}

		setIsStarting(true);

		try {
			let tokenToUse = linkToken;
			if (!isTokenFresh()) {
				tokenToUse = await fetchLinkToken();
			}

			if (!tokenToUse) {
				throw new Error('Unable to fetch Plaid Link token');
			}

			const linkConfig: LinkTokenConfiguration = {
				token: tokenToUse,
			};
			create(linkConfig);

			open({
				onSuccess: async (success: LinkSuccess) => {
					try {
						await apiClient.plaid.exchangePublicToken({
							publicToken: success.publicToken,
						});
						options.onLinkedAccounts?.(
							success.metadata.accounts,
						);
						// Token is single-use for opening Link flow; force refresh next time.
						clearLinkToken();
					} catch (error) {
						console.error(
							'[Plaid Link] Token exchange failed:',
							error,
						);
					} finally {
						setIsStarting(false);
					}
				},
				onExit: (linkExit: LinkExit) => {
					clearLinkToken();
					options.onExit?.(linkExit);
					setIsStarting(false);
				},
			});
		} catch (error) {
			console.error('[Plaid Link] Failed to start flow:', error);
			setIsStarting(false);
		}
	}, [
		clearLinkToken,
		fetchLinkToken,
		isStarting,
		isTokenFresh,
		linkToken,
		options,
	]);

	return {
		hasLinkToken: Boolean(linkToken),
		isStarting,
		startPlaidLink,
		refreshLinkToken,
		clearLinkToken,
	};
}
