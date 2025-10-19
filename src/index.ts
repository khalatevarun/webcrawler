import { url } from 'node:inspector';
import { argv } from 'node:process';
import { getHTML } from './crawl';

const main = async() => {

   const cliArgsLength = argv.length;

   if(cliArgsLength < 3) {
        console.log("Please provide the URL to crawl");
   }
   else if(cliArgsLength > 3) {
        console.log("Too many arguments provided. Please provide only the URL to crawl");
   }
   else {
        const urlToCrawl = argv[2];
        console.log(`Crawling URL: ${urlToCrawl}`);
        await getHTML(urlToCrawl);
   }
   process.exit(0);

}

main();