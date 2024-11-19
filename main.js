#!/usr/bin/env node
import meow from 'meow';
import { fetchJSON, fetchMarkdown } from './src/server-fetch.js';
import { filterByDateRange, filterByMajor } from './src/query.js';
import { createTempDir, deleteTempDir, combineMarkdownFiles } from './src/markdown-combine.js';

const cdnRoot = 'https://cdn.openfin.co/release/meta';
const releasesURL =  `${cdnRoot}/runtime/versions`
const releaseNotesRoot = `${cdnRoot}/runtime/`;
const cli = meow({
    help: [
      'Options',
      '-s --startdate <desired startDate "mm/dd/yyyy">',
      '-e --enddate <desired endDate mm/dd/yyyy> default, Today',
      '-m --major <desired major version "xx">',
      '-t --table <table format> default, JSON',
      '-c --combine <combine markdown files>',
      'Examples:',
      'runtime-version-query --startdate "01/01/2024" --major "38,34"',
      'runtime-version-query -s "01/01/2024" -m "38"'
    ].join('\n'),
    importMeta: import.meta,
    flags: {
        startdate: {
            type: 'string',
            shortFlag: 's'
        },
        enddate: {
            type: 'string',
            shortFlag: 'e',
            default: getCurrentDateFormatted()
        },
        major: {
            type: 'string',
            shortFlag: 'm'
        },
        table: {
            type: 'boolean',
            shortFlag: 't',
            default: false
        },
        combine: {
            type: 'boolean',
            shortFlag: 'c',
            default: false
        }
    }
});

// Function to get the current date in "dd/mm/yyyy" format
function getCurrentDateFormatted() {
    const today = new Date();
  
    // Extract day, month, and year from the current date
    const day = String(today.getDate()).padStart(2, '0');   // Gets the day of the month and pads with '0' if necessary
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Gets the month (0-based index, so +1) and pads with '0'
    const year = today.getFullYear(); // Gets the full year (e.g., 2024)
  
    // Return the formatted date
    return `${month}/${day}/${year}`;
}
function setReleaseNoteUrl(arr) {
    return arr.map(item => {
      item.releaseNotesUrl =  releaseNotesRoot + item.releaseNotesTarget;
      return item;
    });
  }

const { startdate: startDate, enddate: endDate, major, combine } = cli.flags;
let releases = await fetchJSON(releasesURL);

if (major) {
    releases = filterByMajor(releases, major);
}
if (startDate && endDate) {
    releases = filterByDateRange(releases, startDate, endDate);
}

console.log(`startDate: ${startDate}, endDate: ${endDate}, major: ${major}, releases: ${releases.length}`);
if (!cli.flags.table) {
    console.log(releases);
} else {
    const releasesForTabs = setReleaseNoteUrl(releases);
    console.table(releasesForTabs, ["version", "releaseDate", "releaseNotesUrl"]);
}

if (combine) {
    const tempDir = createTempDir();
    const markdownFetchPromises = [];
    releases.forEach(release => {
        markdownFetchPromises.push(fetchMarkdown(releaseNotesRoot + release.releaseNotesTarget, tempDir, `${release.releaseNotesTarget}`));
    });

    await Promise.all(markdownFetchPromises);
    combineMarkdownFiles("combined.md");
    
    deleteTempDir();
}