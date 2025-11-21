// urlHelpers.ts

export const updateImageInCurrentUrl = (newImageUrl: string): string => {
  try {
    const url = new URL(window.location.href); // Use the current page's URL

    url.searchParams.set("image", newImageUrl);

    window.history.replaceState(null, "", url.toString());
    return url.toString();
  } catch (error) {
    console.error("Invalid URL:", error);
    return window.location.href; // Return the original URL if there's an error
  }
};
