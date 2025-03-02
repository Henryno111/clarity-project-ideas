# Stacks Project Ideas Generator
A smart contract for generating and managing project ideas for the Stacks blockchain.

## Features
- Submit new project ideas 
- Vote on existing project ideas
- List all project ideas
- Get details of specific project ideas
- Search/filter project ideas by category

## Setup and Installation
1. Clone the repository
2. Install Clarinet
3. Run `clarinet check` to verify the contract
4. Run `clarinet test` to run test suite

## Usage Examples
```clarity
;; Submit a new project idea
(contract-call? .project-ideas submit-idea "NFT Marketplace" "Create a marketplace for NFTs" "nft")

;; Vote on an idea
(contract-call? .project-ideas vote-idea u1 true)

;; Get idea details
(contract-call? .project-ideas get-idea u1)
```

## Dependencies
- Clarity language
- Clarinet for testing and deployment
