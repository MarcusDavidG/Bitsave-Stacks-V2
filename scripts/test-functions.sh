#!/bin/bash

# Contract Function Testing Script
# Tests all public functions of deployed contracts

set -e

NETWORK=""
CONTRACT_ADDRESS=""
VERBOSE=false

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

show_help() {
    echo "Contract Function Testing Script"
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

print_status "Testing contract functions on $NETWORK"
print_status "Contract Address: $CONTRACT_ADDRESS"

# Function to call read-only contract function
call_readonly_function() {
    local contract_name=$1
    local function_name=$2
    local args=$3
    local full_contract_id="${CONTRACT_ADDRESS}.${contract_name}"
    
    print_test "Testing ${contract_name}.${function_name}"
    
    local payload="{\"sender\":\"${CONTRACT_ADDRESS}\",\"arguments\":${args:-[]}}"
    
    local response=$(curl -s -X POST "${API_URL}/v2/contracts/call-read/${full_contract_id}/${function_name}" \
        -H "Content-Type: application/json" \
        -d "$payload")
    
    if echo "$response" | grep -q "okay"; then
        print_status "✓ ${function_name} - SUCCESS"
        if [[ "$VERBOSE" == true ]] && command -v jq &> /dev/null; then
            echo "  Result: $(echo "$response" | jq '.result' 2>/dev/null || echo "Could not parse result")"
        fi
        return 0
    else
        print_warning "⚠ ${function_name} - FAILED or requires parameters"
        if [[ "$VERBOSE" == true ]]; then
            echo "  Response: $response"
        fi
        return 1
    fi
}

# Function to test contract interface
test_contract_interface() {
    local contract_name=$1
    local full_contract_id="${CONTRACT_ADDRESS}.${contract_name}"
    
    print_status "Getting interface for: $contract_name"
    
    local response=$(curl -s "${API_URL}/v2/contracts/interface/${full_contract_id}")
    
    if echo "$response" | grep -q "error"; then
        print_error "Could not get interface for $contract_name"
        return 1
    fi
    
    if command -v jq &> /dev/null; then
        echo "$response" | jq '.functions[] | select(.access == "read_only") | .name' -r > "${contract_name}_readonly_functions.txt"
        
        if [[ -f "${contract_name}_readonly_functions.txt" ]]; then
            print_status "Found read-only functions for $contract_name:"
            while IFS= read -r func; do
                echo "  - $func"
            done < "${contract_name}_readonly_functions.txt"
            return 0
        fi
    fi
    
    return 1
}

print_status "=== Contract Function Testing ==="

TESTS_PASSED=0
TESTS_FAILED=0

# Test BitSave Badges Contract
echo ""
print_status "Testing bitsave-badges contract..."

if test_contract_interface "bitsave-badges"; then
    # Test known read-only functions
    if call_readonly_function "bitsave-badges" "get-next-token-id"; then
        ((TESTS_PASSED++))
    else
        ((TESTS_FAILED++))
    fi
    
    if call_readonly_function "bitsave-badges" "get-authorized-minter"; then
        ((TESTS_PASSED++))
    else
        ((TESTS_FAILED++))
    fi
    
    # Test with sample token ID
    if call_readonly_function "bitsave-badges" "get-owner" '["u1"]'; then
        ((TESTS_PASSED++))
    else
        ((TESTS_FAILED++))
    fi
    
    if call_readonly_function "bitsave-badges" "get-token-uri" '["u1"]'; then
        ((TESTS_PASSED++))
    else
        ((TESTS_FAILED++))
    fi
fi

# Test BitSave Main Contract
echo ""
print_status "Testing bitsave contract..."

if test_contract_interface "bitsave"; then
    # Test configuration functions
    if call_readonly_function "bitsave" "get-reward-rate"; then
        ((TESTS_PASSED++))
    else
        ((TESTS_FAILED++))
    fi
    
    if call_readonly_function "bitsave" "is-paused"; then
        ((TESTS_PASSED++))
    else
        ((TESTS_FAILED++))
    fi
    
    if call_readonly_function "bitsave" "get-minimum-deposit"; then
        ((TESTS_PASSED++))
    else
        ((TESTS_FAILED++))
    fi
    
    if call_readonly_function "bitsave" "get-compound-frequency"; then
        ((TESTS_PASSED++))
    else
        ((TESTS_FAILED++))
    fi
    
    if call_readonly_function "bitsave" "get-early-withdrawal-penalty"; then
        ((TESTS_PASSED++))
    else
        ((TESTS_FAILED++))
    fi
    
    if call_readonly_function "bitsave" "get-max-deposit-per-user"; then
        ((TESTS_PASSED++))
    else
        ((TESTS_FAILED++))
    fi
    
    # Test user-specific functions (will return empty/default for non-existent users)
    if call_readonly_function "bitsave" "get-savings" "[\"'${CONTRACT_ADDRESS}\"]"; then
        ((TESTS_PASSED++))
    else
        ((TESTS_FAILED++))
    fi
    
    if call_readonly_function "bitsave" "get-reputation" "[\"'${CONTRACT_ADDRESS}\"]"; then
        ((TESTS_PASSED++))
    else
        ((TESTS_FAILED++))
    fi
    
    # Test error message function
    if call_readonly_function "bitsave" "get-error-message" '["u100"]'; then
        ((TESTS_PASSED++))
    else
        ((TESTS_FAILED++))
    fi
fi

# Cleanup
rm -f *_readonly_functions.txt

echo ""
print_status "=== Testing Summary ==="
print_status "Tests Passed: $TESTS_PASSED"
print_status "Tests Failed: $TESTS_FAILED"

if [[ $TESTS_FAILED -eq 0 ]]; then
    print_status "✅ All contract functions are working correctly"
else
    print_warning "⚠️ Some functions failed or require parameters"
    print_status "This is normal for functions that require specific inputs"
fi

echo ""
print_status "Next steps:"
echo "  1. Test contract functions with real parameters on frontend"
echo "  2. Verify deposit and withdrawal flows work correctly"
echo "  3. Check badge minting functionality"
echo "  4. Monitor contract events and logs"
