#!/usr/bin/env node
/**
 * Project Health Check Script
 * Verifies all dependencies, configurations, and setup are correct
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const checks = {
    passed: [],
    failed: [],
    warnings: []
};

function log(type, message) {
    const prefix = {
        pass: '✓',
        fail: '✗',
        warn: '⚠',
        info: 'ℹ'
    };
    console.log(`${prefix[type] || '•'} ${message}`);
}

function checkNodeVersion() {
    try {
        const version = process.version;
        const major = parseInt(version.slice(1).split('.')[0]);
        if (major >= 18) {
            checks.passed.push(`Node.js ${version}`);
            log('pass', `Node.js ${version} - OK`);
        } else {
            checks.failed.push(`Node.js ${version} (requires >=18)`);
            log('fail', `Node.js ${version} - Requires v18 or higher`);
        }
    } catch (error) {
        checks.failed.push('Node.js version check');
        log('fail', 'Could not check Node.js version');
    }
}

function checkFileExists(filePath, name) {
    if (fs.existsSync(filePath)) {
        checks.passed.push(name);
        log('pass', `${name} - exists`);
        return true;
    } else {
        checks.failed.push(name);
        log('fail', `${name} - missing`);
        return false;
    }
}

function checkDependencies(dir, name) {
    const packageJsonPath = path.join(dir, 'package.json');
    const nodeModulesPath = path.join(dir, 'node_modules');

    if (!fs.existsSync(packageJsonPath)) {
        checks.failed.push(`${name} package.json`);
        log('fail', `${name} - package.json missing`);
        return;
    }

    if (!fs.existsSync(nodeModulesPath)) {
        checks.warnings.push(`${name} dependencies`);
        log('warn', `${name} - node_modules not found. Run: npm install`);
        return;
    }

    checks.passed.push(`${name} dependencies`);
    log('pass', `${name} - dependencies installed`);
}

function checkPostgreSQL() {
    try {
        execSync('psql --version', { stdio: 'ignore' });
        checks.passed.push('PostgreSQL');
        log('pass', 'PostgreSQL - installed');
    } catch (error) {
        checks.warnings.push('PostgreSQL');
        log('warn', 'PostgreSQL - not found or not in PATH');
    }
}

function checkEnvFile() {
    const backendEnv = path.join(__dirname, 'backend', '.env');
    if (fs.existsSync(backendEnv)) {
        const content = fs.readFileSync(backendEnv, 'utf8');
        if (content.includes('your_postgres_password_here')) {
            checks.warnings.push('Backend .env configuration');
            log('warn', 'Backend .env - Please set your PostgreSQL password');
        } else {
            checks.passed.push('Backend .env');
            log('pass', 'Backend .env - configured');
        }
    } else {
        checks.failed.push('Backend .env');
        log('fail', 'Backend .env - missing. Copy from .env.example');
    }
}

function checkScripts() {
    const packageJsonPath = path.join(__dirname, 'package.json');
    const backendPackageJsonPath = path.join(__dirname, 'backend', 'package.json');

    try {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (pkg.scripts && pkg.scripts.dev && pkg.scripts.build) {
            checks.passed.push('Frontend scripts');
            log('pass', 'Frontend scripts - configured');
        }

        const backendPkg = JSON.parse(fs.readFileSync(backendPackageJsonPath, 'utf8'));
        if (backendPkg.scripts && backendPkg.scripts.dev && backendPkg.scripts.start) {
            checks.passed.push('Backend scripts');
            log('pass', 'Backend scripts - configured');
        }
    } catch (error) {
        checks.failed.push('Scripts check');
        log('fail', 'Could not verify scripts');
    }
}

console.log('\n================================');
console.log('PROJECT HEALTH CHECK');
console.log('================================\n');

// Run all checks
log('info', 'Checking Node.js version...');
checkNodeVersion();

log('info', '\nChecking essential files...');
checkFileExists(path.join(__dirname, 'package.json'), 'Frontend package.json');
checkFileExists(path.join(__dirname, 'backend', 'package.json'), 'Backend package.json');
checkFileExists(path.join(__dirname, 'vite.config.ts'), 'Vite config');
checkFileExists(path.join(__dirname, 'tsconfig.json'), 'TypeScript config');
checkFileExists(path.join(__dirname, 'backend', '.env.example'), 'Backend .env.example');

log('info', '\nChecking dependencies...');
checkDependencies(__dirname, 'Frontend');
checkDependencies(path.join(__dirname, 'backend'), 'Backend');

log('info', '\nChecking external dependencies...');
checkPostgreSQL();

log('info', '\nChecking configuration...');
checkEnvFile();
checkScripts();

// Summary
console.log('\n================================');
console.log('SUMMARY');
console.log('================================');
console.log(`✓ Passed:   ${checks.passed.length}`);
console.log(`⚠ Warnings: ${checks.warnings.length}`);
console.log(`✗ Failed:   ${checks.failed.length}`);

if (checks.failed.length > 0) {
    console.log('\n❌ CRITICAL ISSUES:');
    checks.failed.forEach(item => console.log(`   - ${item}`));
}

if (checks.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    checks.warnings.forEach(item => console.log(`   - ${item}`));
}

if (checks.failed.length === 0 && checks.warnings.length === 0) {
    console.log('\n✅ All checks passed! Project is ready to run.');
    console.log('\nNext steps:');
    console.log('  1. cd backend && npm run dev');
    console.log('  2. npm run dev (in new terminal)');
} else if (checks.failed.length === 0) {
    console.log('\n⚠️  Project is mostly ready, but has some warnings.');
    console.log('Review warnings above before proceeding.');
} else {
    console.log('\n❌ Project has critical issues. Please fix them before running.');
}

console.log('');
process.exit(checks.failed.length > 0 ? 1 : 0);
