import https from 'https';
import fs from 'fs';
import path from 'path';

// Function to fetch JSON data
export async function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
        let data = '';
    
        // A chunk of data has been received
        response.on('data', (chunk) => {
          data += chunk;
        });
    
        // The whole response has been received
        response.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', (error) => {
        reject(error);
      });
  });
}

export async function fetchMarkdown(url, saveDirectory, filename) {
    // Ensure the save directory exists
    if (!fs.existsSync(saveDirectory)) {
        fs.mkdirSync(saveDirectory, { recursive: true });
    }

    // Create the full path for the output file
    const filePath = path.join(saveDirectory, filename);

    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            // Check if the response status is OK (status code 200)
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP error! Status: ${response.statusCode}`));
            }

            // Create a write stream to save the file
            const file = fs.createWriteStream(filePath);

            // Pipe the response to the file
            response.pipe(file);

            // Close the file stream when the download is complete
            file.on('finish', () => {
                file.close(() => {
                    resolve(filePath);
                });
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}