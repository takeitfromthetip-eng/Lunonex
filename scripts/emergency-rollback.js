#!/usr/bin/env node

/**
 * EMERGENCY ROLLBACK SCRIPT
 * Run this when GitHub f***s everything up
 *
 * Usage: node scripts/emergency-rollback.js
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function exec(command) {
  try {
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    console.error(error.message);
    return null;
  }
}

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n🚨 EMERGENCY ROLLBACK SYSTEM 🚨\n');
  console.log('This will help you recover from GitHub disasters\n');

  // Check if we're in a git repo
  const isGit = exec('git rev-parse --is-inside-work-tree');
  if (!isGit || isGit.trim() !== 'true') {
    console.log('❌ Not a git repository!');
    process.exit(1);
  }

  // Show recent commits
  console.log('📜 Recent commits:\n');
  const recentCommits = exec('git log --oneline -10');
  console.log(recentCommits);

  // Show backup branches
  console.log('\n📦 Available backup branches:\n');
  const backupBranches = exec('git branch -a | grep backup');
  if (backupBranches) {
    console.log(backupBranches);
  } else {
    console.log('No backup branches found');
  }

  console.log('\n🔍 Options:\n');
  console.log('1. Rollback to previous commit (undo last commit)');
  console.log('2. Rollback to specific commit');
  console.log('3. Restore from backup branch');
  console.log('4. Restore from local backup (D: drive)');
  console.log('5. Cancel');

  const choice = await question('\nEnter your choice (1-5): ');

  switch (choice.trim()) {
    case '1': {
      // Rollback one commit
      console.log('\n⚠️  This will undo your last commit (you can redo it later)');
      const confirm1 = await question('Are you sure? (yes/no): ');
      if (confirm1.toLowerCase() === 'yes') {
        console.log('\n🔄 Rolling back last commit...');
        exec('git reset --soft HEAD~1');
        console.log('✅ Rolled back! Your changes are still in staging.');
        console.log('Run "git commit" to recommit, or "git reset --hard HEAD" to discard changes');
      }
      break;
    }

    case '2': {
      // Rollback to specific commit
      const commitHash = await question('\nEnter commit hash: ');
      console.log(`\n⚠️  This will reset to commit ${commitHash}`);
      const confirm2 = await question('Are you sure? (yes/no): ');
      if (confirm2.toLowerCase() === 'yes') {
        console.log('\n🔄 Rolling back to commit...');
        exec(`git reset --hard ${commitHash}`);
        console.log(`✅ Rolled back to ${commitHash}`);
      }
      break;
    }

    case '3': {
      // Restore from backup branch
      const backupList = exec('git branch -a | grep backup | cat -n');
      console.log('\n📦 Backup branches:\n' + backupList);
      const branchName = await question('\nEnter backup branch name: ');
      console.log(`\n⚠️  This will replace current branch with ${branchName}`);
      const confirm3 = await question('Are you sure? (yes/no): ');
      if (confirm3.toLowerCase() === 'yes') {
        console.log('\n🔄 Restoring from backup...');
        exec(`git checkout ${branchName}`);
        exec('git checkout -b main-restored');
        console.log(`✅ Restored from ${branchName}`);
        console.log('You are now on branch "main-restored"');
        console.log('To replace main: git checkout main && git reset --hard main-restored');
      }
      break;
    }

    case '4': {
      // Restore from D: drive backup
      console.log('\n🔍 Scanning D: drive for backups...');
      const backups = exec('ls -lh /d/*.tar.gz 2>/dev/null || echo "No backups found"');
      console.log(backups);
      console.log('\n📖 To restore from backup:');
      console.log('1. cd ..');
      console.log('2. tar -xzf /d/FORTHEWEEBS-OPTIMIZED-[timestamp].tar.gz');
      console.log('3. cd FORTHEWEEBS');
      console.log('4. npm install --legacy-peer-deps');
      console.log('5. npm run build');
      break;
    }

    case '5':
      console.log('\n✅ Cancelled');
      break;

    default:
      console.log('\n❌ Invalid choice');
  }

  rl.close();
}

main().catch(console.error);
