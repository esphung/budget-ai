import { AIMessage } from '@db/types';
import { OpenAiService } from '@services/OpenAiService';
import { useEffect, useRef } from 'react';

/**
 * The probability (0–1) that a greeting is sent when there are already
 * messages in the thread. A new, empty thread always receives a greeting.
 */
const GREETING_PROBABILITY = 0.3;

/**
 * Sends an AI greeting once per session mount.
 * - Always greets when the thread has no messages (first use).
 * - Greets with GREETING_PROBABILITY chance otherwise ("occasionally").
 */
const useGreeting = ({
	threadId,
	messages,
	isMessagesLoaded,
	aiService,
}: {
	threadId: string | null;
	messages: AIMessage[];
	isMessagesLoaded: boolean;
	aiService: OpenAiService | null;
}) => {
	const hasTriggered = useRef(false);

	useEffect(() => {
		if (hasTriggered.current) return;
		if (!threadId || !aiService || !isMessagesLoaded) return;

		hasTriggered.current = true;

		const shouldGreet =
			messages.length === 0 || Math.random() < GREETING_PROBABILITY;

		if (!shouldGreet) return;

		aiService.sendGreeting({ threadId }).catch(() => {
			// Greeting is best-effort; silently ignore network/AI failures.
		});
	}, [threadId, aiService, isMessagesLoaded, messages.length]);
};

export default useGreeting;
