// Function to filter versions by date range
export function filterByDateRange(releases, startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return releases.filter(release => {
    const releaseDate = new Date(release.releaseDate);
    return releaseDate >= start && releaseDate <= end;
  });
}

export function filterByMajor(releases, major) {
    const majorVersions = major.split(",");
    return releases.filter(release => {
        let match = false;
        majorVersions.forEach(element => {
            if (release.version.startsWith(element)) {
                match = true;
            }
        });

        return match;
    });
}
