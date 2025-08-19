#!/bin/bash

# Test the AI Assistant with the exact Category 5 query the user asked about

echo "🌀 Testing AI Assistant - Category 5 Query"
echo "=========================================="
echo ""

WORKER_URL="https://hurricane-ai-simple.jbf-395.workers.dev/"

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}Testing worker at: $WORKER_URL${NC}"
echo ""

# The exact query the user asked
QUERY="What category 5 hurricanes hit the East Coast of Florida in the last 50 years?"

echo -e "${GREEN}Query:${NC} $QUERY"
echo ""
echo -e "${BLUE}Response:${NC}"

# Make the request
response=$(curl -s -X POST "$WORKER_URL" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"$QUERY\"}" 2>/dev/null)

if [ $? -eq 0 ]; then
    # Pretty print the response
    echo "$response" | python3 -c "
import sys, json

try:
    data = json.load(sys.stdin)
    
    # Print the answer
    if 'answer' in data and data['answer']:
        print('📝 Answer:')
        print('-' * 50)
        print(data['answer'])
        print('-' * 50)
    
    # Print suggested filters
    if 'filters' in data and data['filters']:
        print('\n🔍 Suggested Filters:')
        print(json.dumps(data['filters'], indent=2))
    
    # Print any error
    if 'error' in data:
        print('\n⚠️  Error:', data['error'])
        
except Exception as e:
    print('Failed to parse response:', str(e))
    print('Raw response:', sys.stdin.read()[:500])
"
else
    echo -e "${YELLOW}Connection failed. Check if the worker is deployed.${NC}"
fi

echo ""
echo -e "${YELLOW}Expected behavior:${NC}"
echo "1. The AI should provide a detailed answer about Hurricane Andrew (1992)"
echo "2. It should mention Matthew (2016) and Dorian (2019) as Cat 5s that weakened"
echo "3. It should suggest filters for Category 5 and years 1974-2024"
echo "4. The Database tab should be able to apply these filters"
echo ""
echo -e "${GREEN}✓ Test complete!${NC}"