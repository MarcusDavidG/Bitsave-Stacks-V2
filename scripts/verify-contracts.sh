#!/bin/bash

# Contract Verification Script
# Verifies deployed contracts on Stacks blockchain

set -e

NETWORK=""
CONTRACT_ADDRESS=""

# Colors for output
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
    echo "Contract Verification Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -n, --network NETWORK           Target network (testnet|mainnet)"
    echo "  -a, --address CONTRACT_ADDRESS  Contract deployer address"
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

# Set API endpoint based on network
if [[ "$NETWORK" == "testnet" ]]; then
    API_URL="https://api.testnet.hiro.so"
    EXPLORER_URL="https://explorer.hiro.so/?chain=testnet"
elif [[ "$NETWORK" == "mainnet" ]]; then
    API_URL="https://api.hiro.so"
    EXPLORER_URL="https://explorer.hiro.so/?chain=mainnet"
else
    print_error "Invalid network. Use 'testnet' or 'mainnet'"
    exit 1
fi

print_status "Verifying contracts on $NETWORK..."
print_status "Contract Address: $CONTRACT_ADDRESS"
print_status "API Endpoint: $API_URL"

# Function to check contract
check_contract() {
    local contract_name=$1
    local full_contract_id="${CONTRACT_ADDRESS}.${contract_name}"
    
    print_status "Checking contract: $contract_name"
    
    # Get contract info
    local response=$(curl -s "${API_URL}/v2/contracts/interface/${full_contract_id}")
    
    if echo "$response" | grep -q "error"; then
        print_error "Contract $contract_name not found or error occurred"
        echo "Response: $response"
        return 1
    else
        print_status "✓ Contract $contract_name is deployed and accessible"
        
        # Extract and display basic info
        if command -v jq &> /dev/null; then
            echo "Contract Interface:"
            echo "$response" | jq '.functions[] | {name: .name, access: .access}' 2>/dev/null || echo "Could not parse contract interface"
        fi
        
        return 0
    fi
}

# Function to test contract function
test_contract_function() {
    local contract_name=$1
    local function_name=$2
    local full_contract_id="${CONTRACT_ADDRESS}.${contract_name}"
    
    print_status "Testing function: ${contract_name}.${function_name}"
    
    # Call read-only function
    local response=$(curl -s -X POST "${API_URL}/v2/contracts/call-read/${full_contract_id}/${function_name}" \
        -H "Content-Type: application/json" \
        -d '{"sender":"'${CONTRACT_ADDRESS}'","arguments":[]}')
    
    if echo "$response" | grep -q "okay"; then
        print_status "✓ Function $function_name is working"
        if command -v jq &> /dev/null; then
            echo "Result: $(echo "$response" | jq '.result' 2>/dev/null || echo "$response")"
        fi
    else
        print_warning "Function $function_name may have issues or requires parameters"
        echo "Response: $response"
    fi
}

# Check both contracts
print_status "=== Verifying BitSave Contracts ==="

# Check bitsave-badges contract
if check_contract "bitsave-badges"; then
    test_contract_function "bitsave-badges" "get-next-token-id"
    test_contract_function "bitsave-badges" "get-authorized-minter"
fi

echo ""

# Check bitsave contract
if check_contract "bitsave"; then
    test_contract_function "bitsave" "get-reward-rate"
    test_contract_function "bitsave" "is-paused"
    test_contract_function "bitsave" "get-minimum-deposit"
fi

echo ""
print_status "=== Verification Summary ==="
print_status "Network: $NETWORK"
print_status "Contract Address: $CONTRACT_ADDRESS"
print_status "Explorer: ${EXPLORER_URL}&txid=${CONTRACT_ADDRESS}"
print_status "API Endpoint: $API_URL"

echo ""
print_status "Manual verification steps:"
echo "1. Visit the explorer link above"
echo "2. Check contract source code matches your local files"
echo "3. Verify contract functions are callable"
echo "4. Test deposit/withdrawal flows on frontend"
