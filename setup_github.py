#!/usr/bin/env python3
"""
GitHub Repository Setup Script

This script helps initialize a git repository, add files, commit, and push to GitHub.
Run this script from the root directory of your project after creating a repository on GitHub.
"""

import os
import subprocess
import argparse
import sys

def run_command(command, description=None):
    """Run a shell command and print its output."""
    if description:
        print(f"\n{description}...")
    
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, check=True)
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error: {e}")
        if e.stderr:
            print(e.stderr)
        return False

def setup_github_repository(repo_url, branch="main"):
    """Set up the git repository and push to GitHub."""
    steps = [
        {
            "command": "git init",
            "description": "Initializing Git repository"
        },
        {
            "command": "git add .",
            "description": "Adding all files to Git"
        },
        {
            "command": "git status",
            "description": "Checking Git status"
        },
        {
            "command": f'git commit -m "Initial commit: Sensitive Content Moderation System"',
            "description": "Creating initial commit"
        },
        {
            "command": f"git branch -M {branch}",
            "description": f"Setting up {branch} branch"
        },
        {
            "command": f"git remote add origin {repo_url}",
            "description": "Adding GitHub remote"
        },
        {
            "command": f"git push -u origin {branch}",
            "description": f"Pushing to GitHub {branch} branch"
        }
    ]
    
    for step in steps:
        success = run_command(step["command"], step["description"])
        if not success:
            print(f"\nFailed at step: {step['description']}")
            print("You may need to fix the issue and continue manually.")
            return False
    
    print("\n✅ Repository successfully set up and pushed to GitHub!")
    print(f"Your repository is now available at: {repo_url}")
    return True

def main():
    parser = argparse.ArgumentParser(description="Set up and push a Git repository to GitHub.")
    parser.add_argument("repo_url", help="GitHub repository URL (e.g., https://github.com/username/repo.git)")
    parser.add_argument("--branch", default="main", help="Branch name (default: main)")
    
    args = parser.parse_args()
    
    if not args.repo_url:
        print("Error: Repository URL is required.")
        parser.print_help()
        sys.exit(1)
    
    print("🚀 GitHub Repository Setup")
    print(f"Repository URL: {args.repo_url}")
    print(f"Branch: {args.branch}")
    
    confirm = input("\nDo you want to proceed? (y/n): ")
    if confirm.lower() != 'y':
        print("Setup cancelled.")
        sys.exit(0)
    
    setup_github_repository(args.repo_url, args.branch)

if __name__ == "__main__":
    main() 