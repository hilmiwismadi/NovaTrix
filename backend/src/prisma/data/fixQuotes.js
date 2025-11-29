import fs from 'fs';

let content = fs.readFileSync('annexAControls2022.js', 'utf8');

// Replace all smart quotes with regular quotes
content = content.replace(/'/g, "'");
content = content.replace(/'/g, "'");
content = content.replace(/"/g, '"');
content = content.replace(/"/g, '"');

fs.writeFileSync('annexAControls2022.js', content);
console.log('Fixed all smart quotes');
