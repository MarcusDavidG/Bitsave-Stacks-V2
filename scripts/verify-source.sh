#!/bin/bash

# Contract Source Verification Script
# Compares deployed contract source with local files

set -e

NETWORK=""
CONTRACT_ADDRESS=""
VERBOSE=false

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_help() {
    echo "Contract Source Verification Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -n, --network NETWORK           Target network (testnet|mainnet)"
    echo "  -a, --address CONTRACT_ADDRESS  Contract deployer address"
    echo "  -v, --verbose                  Show detailed output"
    echo "  -h, --help                     Show this help message"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--network)
            NETWORK="$2"
            shift 2
            ;;
        -a|--address)
            CONTRACT_ADDRESS="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=true
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

if [[ -z "$NETWORK" || -z "$CONTRACT_ADDRESS" ]]; then
    print_error "Network and contract address are required"
    show_help
    exit 1
fi

# Set API endpoint
if [[ "$NETWORK" == "testnet" ]]; then
    API_URL="https://api.testnet.hiro.so"
elif [[ "$NETWORK" == "mainnet" ]]; then
    API_URL="https://api.hiro.so"
else
    print_error "Invalid network. Use 'testnet' or 'mainnet'"
    exit 1
fi

print_status "Verifying contract source code on $NETWORK"
print_status "Contract Address: $CONTRACT_ADDRESS"

# Function to get deployed contract source
get_deployed_source() {
    local contract_name=$1
    local full_contract_id="${CONTRACT_ADDRESS}.${contract_name}"
    
    print_status "Fetching deployed source for: $contract_name"
    
    local response=$(curl -s "${API_URL}/v2/contracts/source/${full_contract_id}")
    
    if echo "$response" | grep -q "error"; then
        print_error "Could not fetch source for $contract_name"
        return 1
    fi
    
    # Extract source code from JSON response
    if command -v jq &> /dev/null; then
        echo "$response" | jq -r '.source' > "deployed_${contract_name}.clar"
    else
        # Fallback without jq
        echo "$response" | sed 's/.*"source":"\([^"]*\)".*/\1/' | sed 's/\\n/\n/g' > "deployed_${contract_name}.clar"
    fi
    
    if [[ -f "deployed_${contract_name}.clar" ]]; then
        print_status "✓ Source fetched for $contract_name"
        return 0
    else
        print_error "Failed to save source for $contract_name"
        return 1
    fi
}

# Function to compare sources
compare_sources() {
    local contract_name=$1
    local local_file="contracts/${contract_name}.clar"
    local deployed_file="deployed_${contract_name}.clar"
    
    if [[ ! -f "$local_file" ]]; then
        print_error "Local file not found: $local_file"
        return 1
    fi
    
    if [[ ! -f "$deployed_file" ]]; then
        print_error "Deployed file not found: $deployed_file"
        return 1
    fi
    
    print_status "Comparing sources for: $contract_name"
    
    # Remove whitespace and compare
    local local_hash=$(cat "$local_file" | tr -d '[:space:]' | sha256sum | cut -d' ' -f1)
    local deployed_hash=$(cat "$deployed_file" | tr -d '[:space:]' | sha256sum | cut -d' ' -f1)
    
    if [[ "$local_hash" == "$deployed_hash" ]]; then
        print_status "✓ Source code matches for $contract_name"
        if [[ "$VERBOSE" == true ]]; then
            echo "  Local hash: $local_hash"
            echo "  Deployed hash: $deployed_hash"
        fi
        return 0
    else
        print_warning "⚠ Source code differs for $contract_name"
        echo "  Local hash: $local_hash"
        echo "  Deployed hash: $deployed_hash"
        
        if command -v diff &> /dev/null; then
            echo ""
            print_status "Differences found:"
            diff -u "$local_file" "$deployed_file" || true
        fi
        return 1
    fi
}

# Function to cleanup temporary files
cleanup() {
    rm -f deployed_*.clar
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Main verification process
print_status "=== Contract Source Verification ==="

VERIFICATION_PASSED=true

# Verify bitsave-badges contract
if get_deployed_source "bitsave-badges"; then
    if ! compare_sources "bitsave-badges"; then
        VERIFICATION_PASSED=false
    fi
else
    VERIFICATION_PASSED=false
fi

echo ""

# Verify bitsave contract
if get_deployed_source "bitsave"; then
    if ! compare_sources "bitsave"; then
        VERIFICATION_PASSED=false
    fi
else
    VERIFICATION_PASSED=false
fi

echo ""
print_status "=== Verification Summary ==="

if [[ "$VERIFICATION_PASSED" == true ]]; then
    print_status "✅ All contract sources verified successfully"
    print_status "Deployed contracts match local source code"
else
    print_warning "⚠️ Source verification failed"
    print_warning "Deployed contracts may differ from local source code"
    echo ""
    print_status "Possible reasons:"
    echo "  - Local files have been modified after deployment"
    echo "  - Different version was deployed"
    echo "  - Whitespace or formatting differences"
    echo "  - Network or API issues"
fi

echo ""
print_status "Manual verification recommended:"
echo "  1. Check contract functions work as expected"
echo "  2. Verify contract behavior matches documentation"
echo "  3. Test all user flows on frontend"
