/**

 * Read-only checks for CP4N deployment health (CSP header + contract file).

 * Usage: node ./src/tools/verifyCp4nDeploy.js [host] [project]

 * Default host: 172.21.100.151, project: system

 */

const https = require('https');

const {

	analyzeFrameAncestors,

	frameAncestorsRemediationSteps,

} = require('./cp4nCspCheck');



const host = process.argv[2] || '172.21.100.151';

const project = process.argv[3] || 'system';



function fetch(url) {

	return new Promise((resolve, reject) => {

		const req = https.get(url, { rejectUnauthorized: false }, (res) => {

			let body = '';

			res.on('data', (chunk) => {

				body += chunk;

			});

			res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));

		});

		req.on('error', reject);

		req.setTimeout(10000, () => {

			req.destroy(new Error('timeout'));

		});

	});

}



async function main() {

	let failed = false;



	console.log(`Checking https://${host}/${project}/ ...`);



	try {

		const index = await fetch(`https://${host}/${project}/index.html`);

		const csp = index.headers['content-security-policy'] || '';

		console.log(`index.html: HTTP ${index.status}`);



		if (csp) {

			console.log(`Content-Security-Policy: ${csp}`);

		}



		const { sources, issues } = analyzeFrameAncestors(csp);



		if (sources.length > 0) {

			console.log(`frame-ancestors sources: ${sources.join(' ')}`);

		}



		if (issues.length > 0) {

			console.error('FAIL: Malformed or problematic frame-ancestors entries:');

			for (const issue of issues) {

				console.error(`  - ${issue.source}: ${issue.reason}`);

			}

			console.error('');

			console.error('Remediation (on the CP4N — not fixable from the CH5 project build):');

			for (const step of frameAncestorsRemediationSteps(host)) {

				console.error(`  • ${step}`);

			}

			console.error('');

			console.error('See docs/help-manual-csp.md for details.');

			failed = true;

		} else if (sources.length > 0) {

			console.log('OK: frame-ancestors present without detected issues.');

		} else {

			console.log('OK: No frame-ancestors clause in CSP header.');

		}

	} catch (error) {

		console.error(`FAIL: Could not fetch index.html — ${error.message}`);

		failed = true;

	}



	try {

		const contract = await fetch(

			`https://${host}/${project}/config/contract.cse2j`,

		);

		console.log(`contract.cse2j: HTTP ${contract.status}`);

		if (contract.status !== 200) {

			console.error('FAIL: contract.cse2j not found on processor.');

			failed = true;

		} else {

			try {

				JSON.parse(contract.body);

				console.log('OK: contract.cse2j is valid JSON.');

			} catch {

				console.error('FAIL: contract.cse2j is not valid JSON.');

				failed = true;

			}

		}

	} catch (error) {

		console.error(`FAIL: Could not fetch contract.cse2j — ${error.message}`);

		failed = true;

	}



	process.exit(failed ? 1 : 0);

}



main();


