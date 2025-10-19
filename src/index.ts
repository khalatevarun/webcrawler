import { argv } from 'node:process';
import { crawlSiteAsync } from './crawl';
import { writeCSVReport } from './report';

const main = async() => {

   const cliArgsLength = argv.length;

   if(cliArgsLength < 3) {
        console.log("Please provide the URL to crawl");
   }
   else if(cliArgsLength > 5) {
        console.log("Too many arguments provided. Please provide only the URL, Max Concurrecy and Max Pages to crawl");
   }
   else {
        const urlToCrawl = argv[2];
        const maxConcurrency = Number(argv[3]);
        const maxPages = Number(argv[4]);

        if (!Number.isFinite(maxConcurrency) || maxConcurrency <= 0) {
            console.log("invalid maxConcurrency");
            process.exit(1);
        }
        if (!Number.isFinite(maxPages) || maxPages <= 0) {
            console.log("invalid maxPages");
            process.exit(1);
        }

        console.log(
            `starting crawl of: ${urlToCrawl} (concurrency=${maxConcurrency}, maxPages=${maxPages})...`,
        );

    const pageData = await crawlSiteAsync(urlToCrawl, maxConcurrency, maxPages);
    writeCSVReport(pageData);
   }
   process.exit(0);

   
}

main();