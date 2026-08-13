const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONTRACT_FILE = path.join('src', 'contract', 'contract.cse2j');

function contractArchiveArg() {
	if (!fs.existsSync(CONTRACT_FILE)) {
		console.warn(
			`Contract file not found at ${CONTRACT_FILE}; archive will omit config/contract.cse2j.`,
		);
		return '';
	}
	return `-c '${CONTRACT_FILE.replace(/\\/g, '/')}'`;
}

try {
	var env = fs.readFileSync('./.env', 'utf-8');

	var VITE_SYSTEMS_Line = env
		.split('\n')
		.find((line) => line.startsWith('VITE_SYSTEMS='));

	if (VITE_SYSTEMS_Line.indexOf('{') && VITE_SYSTEMS_Line.indexOf('}', 1)) {
		var VITE_SYSTEMS_Value = VITE_SYSTEMS_Line.substring(
			VITE_SYSTEMS_Line.indexOf('{', index),
			VITE_SYSTEMS_Line.lastIndexOf('}') + 1,
		);
		var systems = [];
		var index = 0;
		while (VITE_SYSTEMS_Value.includes('},{', index)) {
			systems.push(
				JSON.parse(
					VITE_SYSTEMS_Value.substring(
						index,
						VITE_SYSTEMS_Value.indexOf('},{', index) + 1,
					),
				),
			);
			index = VITE_SYSTEMS_Value.indexOf('},{', index) + 2;
		}
		systems.push(
			JSON.parse(
				VITE_SYSTEMS_Value.substring(index, VITE_SYSTEMS_Value.length),
			),
		);

		systems.forEach((system) => {
			if (system.projectName) {
				var VITE_STATIC_PROJECT_NAME_Line = env
					.split('\n')
					.find((line) =>
						line.startsWith('VITE_STATIC_PROJECT_NAME='),
					);
				var newEnv = env.replace(
					VITE_STATIC_PROJECT_NAME_Line,
					`VITE_STATIC_PROJECT_NAME='${system.projectName}'`,
				);
				fs.writeFileSync('./.env', newEnv, 'utf-8');

				try {
					execSync(`npx vite build`, {
						shell: 'powershell.exe',
						stdio: 'inherit',
					});

					console.log(
						`Creating archive for ${system.projectName}...`,
					);
					execSync(
						`npx ch5-cli archive -p '${system.projectName}' -d build -o dist ${contractArchiveArg()}`.trim(),
						{
							shell: 'powershell.exe',
							stdio: 'inherit',
						},
					);
				} catch (error) {
					console.error(`Error: ${error.message}`);
				}
			}
		});
	}

	var VITE_UNIVERSAL_PROJECT_NAME = env
		.split('\n')
		.find((line) => line.startsWith('VITE_UNIVERSAL_PROJECT_NAME='))
		.split('=')[1]
		.replaceAll("'", '')
		.replaceAll('\r', '')
		.replaceAll('\n', '')
		.trim();
	var VITE_STATIC_PROJECT_NAME_Line = env
		.split('\n')
		.find((line) => line.startsWith('VITE_STATIC_PROJECT_NAME='));
	var newEnv = env.replace(
		VITE_STATIC_PROJECT_NAME_Line,
		`VITE_STATIC_PROJECT_NAME=''`,
	);
	fs.writeFileSync('./.env', newEnv, 'utf-8');

	try {
		execSync(`npx vite build`, {
			shell: 'powershell.exe',
			stdio: 'inherit',
		});

		console.log(`Creating universal archive...`);
		execSync(
			`npx ch5-cli archive -p '${VITE_UNIVERSAL_PROJECT_NAME}' -d build -o dist ${contractArchiveArg()}`.trim(),
			{
				shell: 'powershell.exe',
				stdio: 'inherit',
			},
		);
	} catch (error) {
		console.error(`Error: ${error.message}`);
	}
} catch (err) {
	console.error('Error reading .env file: ', err);
}
