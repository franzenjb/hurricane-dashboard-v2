#!/bin/bash

# Fetch 2024 Hurricane TCR Reports from NOAA
# Focus on major storms that impacted the US

echo "📥 Fetching 2024 Hurricane TCR Reports..."
echo "========================================="

# Create directory for TCR data
mkdir -p tcr-data/2024

# Key 2024 storms to fetch
declare -a storms=(
    "AL052024_Debby"      # Cat 1, Florida landfall
    "AL062024_Ernesto"    # Major hurricane
    "AL092024_Helene"     # Cat 4, Florida Big Bend
    "AL102024_Isaac"      # Hurricane
    "AL142024_Milton"     # Cat 5, Sarasota landfall
    "AL182024_Rafael"     # Cat 3 in Gulf
)

echo ""
echo "Downloading PDF reports..."
for storm in "${storms[@]}"; do
    echo "  📄 Fetching $storm.pdf..."
    curl -s -o "tcr-data/2024/${storm}.pdf" \
         "https://www.nhc.noaa.gov/data/tcr/${storm}.pdf"
done

echo ""
echo "Downloading KMZ track files..."
for storm in "${storms[@]}"; do
    echo "  🌍 Fetching ${storm}_5day.kmz..."
    curl -s -o "tcr-data/2024/${storm}_5day.kmz" \
         "https://www.nhc.noaa.gov/data/tcr/${storm}_5day.kmz"
done

echo ""
echo "✅ Download complete!"
echo ""
echo "Key files downloaded:"
echo "  • Helene TCR: tcr-data/2024/AL092024_Helene.pdf"
echo "  • Milton TCR: tcr-data/2024/AL142024_Milton.pdf"
echo ""
echo "To extract data from PDFs:"
echo "  1. Open PDF and copy narrative sections"
echo "  2. Extract casualty counts from Table 1"
echo "  3. Get damage estimates from summary"
echo "  4. Add storm surge measurements to database"