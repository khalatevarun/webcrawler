export const normalizeURL = (input: string) => {
    const urlObj = new URL(input);
    let fullPath = `${urlObj.host}${urlObj.pathname}`;
    if(fullPath.endsWith('/')) {
        fullPath = fullPath.slice(0, -1);
    }
    return fullPath.toLowerCase();

}