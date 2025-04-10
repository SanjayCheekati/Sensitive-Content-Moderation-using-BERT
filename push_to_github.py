#!/usr/bin/env python3
"""
GitHub Repository Setup Script

This script helps initialize a git repository, add files, commit, and push to GitHub.
It guides you through each step with clear instructions and confirmation prompts.
"""

import os
import subprocess
import argparse
import sys
from getpass import getpass

def run_command(command, description=None, show_output=True):
    """Execute a shell command and handle errors."""
    if description:
        print(f"\n➡️ {description}")
    
    try:
        result = subprocess.run(
            command,
            shell=True,
            check=True,
            text=True,
            capture_output=True
        )
        if show_output and result.stdout:
            print(result.stdout)
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: {e}")
        if e.stdout:
            print(f"Output: {e.stdout}")
        if e.stderr:
            print(f"Error details: {e.stderr}")
        return False, None

def setup_github_repository(repo_url, branch="main"):
    """Set up a GitHub repository with the given URL and branch."""
    # Step 1: Initialize git repository
    success, _ = run_command("git init", "Initializing git repository")
    if not success:
        return False

    # Step 2: Add all files
    success, _ = run_command("git add .", "Adding all files to git")
    if not success:
        return False

    # Step 3: Commit files
    commit_msg = "Initial commit: Sensitive Content Moderation System"
    success, _ = run_command(f'git commit -m "{commit_msg}"', "Committing files")
    if not success:
        return False

    # Step 4: Add remote
    success, _ = run_command(f"git remote add origin {repo_url}", "Adding remote origin")
    if not success:
        return False

    # Step 5: Push to GitHub
    success, _ = run_command(f"git push -u origin {branch}", f"Pushing to {branch} branch")
    if not success:
        return False

    print(f"\n✅ Successfully set up repository and pushed to {repo_url}")
    return True

def check_git_installed():
    """Check if git is installed."""
    success, _ = run_command("git --version", "Checking git installation", show_output=False)
    return success

def main():
    """Main function to handle arguments and run the setup."""
    parser = argparse.ArgumentParser(description="Set up a GitHub repository for the Sensitive Content Moderation System")
    parser.add_argument("--repo-url", type=str, help="GitHub repository URL (e.g., https://github.com/username/repo.git)")
    parser.add_argument("--branch", type=str, default="main", help="Branch name (default: main)")
    args = parser.parse_args()

    # Check if git is installed
    if not check_git_installed():
        print("❌ Git is not installed or not in PATH. Please install git and try again.")
        return

    # Get repository URL if not provided
    repo_url = args.repo_url
    if not repo_url:
        repo_url = input("\nEnter GitHub repository URL (e.g., https://github.com/username/repo.git): ")

    # Get branch name if not default
    branch = args.branch
    if branch != "main":
        print(f"\nUsing branch: {branch}")

    # Prompt for confirmation
    print("\n🔍 Repository Setup Summary:")
    print(f"   - Repository URL: {repo_url}")
    print(f"   - Branch: {branch}")
    
    confirm = input("\nProceed with repository setup? (y/n): ")
    if confirm.lower() != 'y':
        print("❌ Setup cancelled.")
        return

    # Set up repository
    setup_github_repository(repo_url, branch)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Setup cancelled by user.")
        sys.exit(1) 