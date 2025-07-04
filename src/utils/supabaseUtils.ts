export function extractPathFromUrl(url: string, bucketName: string) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname; 
      // pathname example: /storage/v1/object/public/library-management-api/e3acc936-0ecc-4641-9e8d-fed8c222f7e5.jpg
      // Remove prefix: /storage/v1/object/public/{bucketName}/
      const prefix = `/storage/v1/object/public/${bucketName}/`;
      if (pathname.startsWith(prefix)) {
        return pathname.slice(prefix.length);
      }
      return null;
    } catch {
      return null;
    }
  }