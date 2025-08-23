#!/usr/bin/env node

const fs = require('fs');

// Read the database file
let content = fs.readFileSync('atlantic-storms-enhanced.js', 'utf8');

// Count narratives ending with ...
const beforeCount = (content.match(/narrative":\s*"[^"]*\.\.\./g) || []).length;
console.log(`Found ${beforeCount} narratives ending with ...`);

// Replace all instances of narratives ending with ...
// This regex captures the narrative text and removes the trailing ...
content = content.replace(
    /(narrative":\s*"[^"]*)\.\.\./g,
    '$1.'
);

// Verify the changes
const afterCount = (content.match(/narrative":\s*"[^"]*\.\.\./g) || []).length;
console.log(`After fix: ${afterCount} narratives ending with ...`);

// Write the updated content back
fs.writeFileSync('atlantic-storms-enhanced.js', content);

console.log(`✅ Fixed ${beforeCount - afterCount} narratives`);

// Show some examples of what was fixed
const examples = content.match(/"storm_id":\s*"AL\d+2024"[^}]*narrative[^"]*"[^"]*"/g);
if (examples) {
    console.log('\n2024 storms checked:');
    examples.slice(0, 3).forEach(ex => {
        const id = ex.match(/"storm_id":\s*"([^"]+)"/)[1];
        const hasEllipsis = ex.includes('...');
        console.log(`- ${id}: ${hasEllipsis ? '❌ Still has ...' : '✅ Clean'}`);
    });
}