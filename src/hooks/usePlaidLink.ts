import {
	ExchangePublicTokenRequest,
	ExchangePublicTokenResponse,
	GetLinkTokenResponse,
} from '@services/ApiClient';
import { useCallback, useMemo, useState } from 'react';
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
	exchangePublicToken: (
		body: ExchangePublicTokenRequest,
		signal?: AbortSignal,
	) => Promise<ExchangePublicTokenResponse>;
	getLinkToken: (
		signal?: AbortSignal | undefined,
	) => Promise<GetLinkTokenResponse>;
}

interface UsePlaidLinkResult {
	hasLinkToken: boolean;
	isStarting: boolean;
	startPlaidLink: () => Promise<void>;
	refreshLinkToken: () => Promise<string | null>;
	clearLinkToken: () => void;
}

export function usePlaidLink(
	options: UsePlaidLinkOptions = {
		onLinkedAccounts: () => {},
		onExit: () => {},
		exchangePublicToken: async () => {
			throw new Error('exchangePublicToken function not provided');
		},
		getLinkToken: async () => {
			throw new Error('getLinkToken function not provided');
		},
	},
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
		const result = await options.getLinkToken();
		setLinkToken(result.link_token ?? null);
		setTokenFetchedAt(Date.now());
		return result.link_token ?? null;
	}, [options]);

	const isTokenFresh = useMemo(
		() => () =>
			linkToken && tokenFetchedAt
				? Date.now() - tokenFetchedAt < TOKEN_MAX_AGE_MS
				: false,
		[linkToken, tokenFetchedAt],
	);

	const refreshLinkToken = useCallback(fetchLinkToken, [fetchLinkToken]);

	const startPlaidLink = useCallback(async () => {
		if (isStarting) return;

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
						await options.exchangePublicToken({
							publicToken: success.publicToken,
						});
						options.onLinkedAccounts?.(
							success.metadata.accounts,
						);
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
