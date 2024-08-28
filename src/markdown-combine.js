import os from 'os';
import path from 'path';
import fs from 'fs';

const tempDir = os.tmpdir();
const markdownTemp = path.join(tempDir, 'version-markdown');

export function createTempDir() {
    fs.mkdtempSync(markdownTemp);
    return  markdownTemp;
}

export function deleteTempDir() {
    fs.rmSync(markdownTemp, { recursive: true });
}

export function combineMarkdownFiles(outputMarkdownFile) {
    const files = fs.readdirSync(markdownTemp);
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    const sectionHeaders = ['#### New Features', '#### Enhancements', '#### Resolved Issues','#### Chromium Release Notes', '#### Electron Release Notes', '#### Deprecations and Behavioral Changes'];

    combineMarkdownSections(markdownFiles, outputMarkdownFile, sectionHeaders);
}

// Function to extract specific sections from a markdown file
function extractSections(content, sectionHeaders) {
    const sections = {};
    let currentSection = null;
    const sectionHeaderSet = new Set(sectionHeaders.map(header => header.trim()));
  
    // Split content by lines
    const lines = content.split('\n');
  
    lines.forEach((line) => {
      const trimmedLine = line.trim();
  
      // Check if the line matches any of the section headers
      if (sectionHeaderSet.has(trimmedLine)) {
        currentSection = trimmedLine;
        sections[currentSection] = [];  // Start a new section
      } else if (currentSection && sectionHeaderSet.has(trimmedLine)) {
        // Encountering a new specified header resets currentSection
        currentSection = trimmedLine;
        sections[currentSection] = [];  // Start a new section
      } else if (currentSection && trimmedLine.startsWith('####')) {
        // Exit current section if another header is found that isn't listed
        currentSection = null;
      } else if (currentSection) {
        // If within a section, add lines to the current section
        sections[currentSection].push(line);
      }
    });
  
    // Convert arrays to strings
    for (const header in sections) {
      sections[header] = sections[header].join('\n').trim();
    }
  
    return sections;
  }
  
  // Function to combine specific sections from multiple markdown files
  function combineMarkdownSections(inputFiles, outputFile, sectionHeaders) {
    const combinedSections = {};
  
    // Initialize sections in the combinedSections object
    sectionHeaders.forEach((header) => {
      combinedSections[header] = `${header}\n\n`;
    });
  
    inputFiles.forEach((filePath) => {
      const content = fs.readFileSync(path.join(markdownTemp, filePath), 'utf-8');
      const sections = extractSections(content, sectionHeaders);
  
      // Append the extracted sections to the combined sections
      sectionHeaders.forEach((header) => {
        if (sections[header]) {
          combinedSections[header] += sections[header] + '\n\n';
        }
      });
    });
  
    // Combine all sections into a single string
    const outputContent = Object.values(combinedSections).join('\n');
  
    // Write the combined content to the output file
    fs.writeFileSync(outputFile, outputContent, 'utf-8');
    console.log(`Combined sections saved to ${outputFile}`);
}