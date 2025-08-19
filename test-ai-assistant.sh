#!/bin/bash

# Test script for AI Hurricane Assistant
# This tests both the current simple worker and shows what the AI-powered version will return

echo "🌀 Hurricane AI Assistant Test Script"
echo "======================================"
echo ""

WORKER_URL="https://hurricane-ai-simple.jbf-395.workers.dev/"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Testing worker at: $WORKER_URL${NC}"
echo ""

# Test queries
declare -a queries=(
    "When do hurricanes typically hit west Florida?"
    "Tell me about Hurricane Milton in 2024"
    "What were the impacts of Hurricane Helene?"
    "Show me all Category 5 hurricanes"
    "Compare 2024 to 2004 for Florida"
    "Why is Tampa Bay vulnerable to hurricanes?"
)

echo -e "${YELLOW}Running test queries...${NC}"
echo ""

for query in "${queries[@]}"; do
    echo -e "${GREEN}Query:${NC} $query"
    echo -e "${BLUE}Response:${NC}"
    
    response=$(curl -s -X POST "$WORKER_URL" \
        -H "Content-Type: application/json" \
        -d "{\"query\": \"$query\"}" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        # Pretty print the JSON response
        echo "$response" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if 'answer' in data:
        print('  Answer:', data['answer'][:200] + '...' if len(data.get('answer', '')) > 200 else data.get('answer', 'No answer'))
    if 'filters' in data and data['filters']:
        print('  Filters:', json.dumps(data['filters'], indent=2))
    if 'error' in data:
        print('  Error:', data['error'])
except:
    print('  Raw response:', sys.stdin.read()[:200])
" 2>/dev/null || echo "$response" | head -c 200
    else
        echo -e "  ${RED}Connection failed${NC}"
    fi
    
    echo ""
    echo "---"
    echo ""
done

echo -e "${YELLOW}Expected improvements after deploying ai-powered-worker.js:${NC}"
echo ""
echo "BEFORE (Current): Simple pattern matching"
echo "  - Returns generic 'Looking at Hurricane Ida' responses"
echo "  - No real hurricane knowledge"
echo "  - Basic filter extraction only"
echo ""
echo "AFTER (With Claude API): Intelligent responses"
echo "  - Detailed analysis of Helene & Milton 2024 impacts"
echo "  - Historical context and comparisons"
echo "  - Specific wind speeds, surge heights, casualties"
echo "  - Geographic vulnerability analysis"
echo "  - Smart filter suggestions based on context"
echo ""
echo -e "${GREEN}✓ Test complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps to enable AI intelligence:${NC}"
echo "1. Go to https://workers.cloudflare.com/"
echo "2. Open your 'hurricane-ai-simple' worker"
echo "3. Replace code with contents of ai-powered-worker.js"
echo "4. Add ANTHROPIC_API_KEY in Settings > Variables"
echo "5. Save and Deploy"
echo ""
echo "Or use the alternative Cloudflare AI (free, no API key needed)"