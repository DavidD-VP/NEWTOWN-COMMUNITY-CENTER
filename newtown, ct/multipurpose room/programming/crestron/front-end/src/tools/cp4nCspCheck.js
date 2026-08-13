/**
 * Parse and validate CP4N Content-Security-Policy frame-ancestors sources.
 */

/** Known malformed fragments observed on 4-Series HTTPS web servers. */
const KNOWN_BAD_SUBSTRINGS = ['https://.21.100.151', 'https://00.151'];

/**
 * @param {string} csp
 * @returns {string[]}
 */
function extractFrameAncestors(csp) {
	const match = csp.match(/frame-ancestors\s+([^;]+)/i);
	if (!match) return [];
	return match[1].trim().split(/\s+/).filter(Boolean);
}

/**
 * @param {string} source
 * @returns {string | undefined}
 */
function describeBadFrameAncestor(source) {
	if (/^https?:\/\/\.[\d.]+/i.test(source)) {
		return 'host starts with a dot (truncated IP — firmware parsing bug)';
	}
	if (/^https?:\/\/\d{1,2}\.\d{1,3}$/i.test(source)) {
		return 'host is a partial IP fragment (truncated IP — firmware parsing bug)';
	}
	if (/^https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/i.test(source)) {
		return 'IP literal in frame-ancestors — browsers may reject; use \'self\' instead when UI is top-level';
	}
	return undefined;
}

/**
 * @param {string} csp
 * @returns {{ sources: string[]; issues: { source: string; reason: string }[] }}
 */
function analyzeFrameAncestors(csp) {
	const sources = extractFrameAncestors(csp);
	const issues = [];

	for (const source of sources) {
		const reason = describeBadFrameAncestor(source);
		if (reason) {
			issues.push({ source, reason });
		}
	}

	for (const bad of KNOWN_BAD_SUBSTRINGS) {
		if (csp.includes(bad) && !issues.some((i) => i.source.includes(bad.replace('https://', '')))) {
			issues.push({ source: bad, reason: 'known malformed host fragment' });
		}
	}

	return { sources, issues };
}

/**
 * @param {string} host
 * @returns {string[]}
 */
function frameAncestorsRemediationSteps(host) {
	return [
		`Open https://${host}/setup → Security and remove custom frame-ancestor / CSP allowed-host entries.`,
		'Crestron Toolbox → Web Pages and Mobility Projects: clear any "allowed framing" hosts that include the processor IP.',
		'Target policy for this project (top-level UI, no iframe): frame-ancestors \'self\' only.',
		'Reload https://' + host + '/system/index.html and confirm console has no red frame-ancestors errors.',
		'Re-run: npm run verify:cp4n -- ' + host,
	];
}

module.exports = {
	extractFrameAncestors,
	analyzeFrameAncestors,
	frameAncestorsRemediationSteps,
};
