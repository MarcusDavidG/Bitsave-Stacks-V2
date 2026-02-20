#!/bin/bash

# BitSave Automated Deployment Script
# Handles both testnet and mainnet deployments with validation

set -e

NETWORK=""
SKIP_TESTS=false
SKIP_VALIDATION=false
DRY_RUN=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Help function
show_help() {
    echo "BitSave Automated Deployment Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -n, --network NETWORK    Target network (testnet|mainnet)"
    echo "  -s, --skip-tests        Skip test execution"
    echo "  -v, --skip-validation   Skip contract validation"
    echo "  -d, --dry-run          Show what would be deployed without executing"
    echo "  -h, --help             Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --network testnet"
    echo "  $0 --network mainnet --skip-tests"
    echo "  $0 --network testnet --dry-run"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--network)
            NETWORK="$2"
            shift 2
            ;;
        -s|--skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        -v|--skip-validation)
            SKIP_VALIDATION=false
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate network parameter
if [[ -z "$NETWORK" ]]; then
    print_error "Network parameter is required"
    show_help
    exit 1
fi

if [[ "$NETWORK" != "testnet" && "$NETWORK" != "mainnet" ]]; then
    print_error "Network must be either 'testnet' or 'mainnet'"
    exit 1
fi

print_status "Starting BitSave deployment to $NETWORK"

# Check prerequisites
print_status "Checking prerequisites..."

if ! command -v clarinet &> /dev/null; then
    print_error "Clarinet not found. Please install clarinet first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm not found. Please install Node.js and npm first."
    exit 1
fi

# Check configuration file
CONFIG_FILE="settings/${NETWORK^}.toml"
if [[ ! -f "$CONFIG_FILE" ]]; then
    print_error "Configuration file not found: $CONFIG_FILE"
    print_warning "Please set up your $NETWORK configuration with proper mnemonics"
    exit 1
fi

# Validate contracts
if [[ "$SKIP_VALIDATION" == false ]]; then
    print_status "Validating contracts..."
    if ! clarinet check; then
        print_error "Contract validation failed"
        exit 1
    fi
    print_status "Contract validation passed"
fi

# Run tests
if [[ "$SKIP_TESTS" == false ]]; then
    print_status "Running test suite..."
    if ! npm test; then
        print_error "Tests failed"
        exit 1
    fi
    print_status "All tests passed"
fi

# Dry run check
if [[ "$DRY_RUN" == true ]]; then
    print_status "DRY RUN MODE - Would deploy the following:"
    echo "  - Network: $NETWORK"
    echo "  - Contracts: bitsave-badges.clar, bitsave.clar"
    echo "  - Configuration: $CONFIG_FILE"
    echo ""
    print_warning "This is a dry run. No actual deployment will occur."
    exit 0
fi

# Final confirmation for mainnet
if [[ "$NETWORK" == "mainnet" ]]; then
    print_warning "WARNING: This will deploy to MAINNET with real STX tokens"
    read -p "Are you sure you want to deploy to mainnet? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Deployment cancelled"
        exit 1
    fi
fi

# Deploy contracts
print_status "Deploying contracts to $NETWORK..."
if ! clarinet deployments apply --$NETWORK; then
    print_error "Contract deployment failed"
    exit 1
fi

# Set up badge minting authorization
MINTER_PLAN="deployments/set-minter.$NETWORK-plan.yaml"
if [[ -f "$MINTER_PLAN" ]]; then
    print_status "Setting up badge minting authorization..."
    if ! clarinet deployments apply -p "$MINTER_PLAN" --$NETWORK; then
        print_warning "Badge minting setup failed, but contracts are deployed"
    else
        print_status "Badge minting authorization configured"
    fi
fi

print_status "Deployment completed successfully!"
echo ""
print_status "Next steps:"
echo "  1. Verify contracts on ${NETWORK} explorer"
echo "  2. Update frontend with deployed contract addresses"
echo "  3. Run integration tests"
if [[ "$NETWORK" == "testnet" ]]; then
    echo "  4. Test contract functions manually"
    echo "  5. Prepare for mainnet deployment"
    echo ""
    echo "🔗 Testnet Explorer: https://explorer.hiro.so/?chain=testnet"
else
    echo "  4. Monitor contract performance"
    echo "  5. Announce launch to community"
    echo ""
    echo "🔗 Mainnet Explorer: https://explorer.hiro.so/?chain=mainnet"
fi
