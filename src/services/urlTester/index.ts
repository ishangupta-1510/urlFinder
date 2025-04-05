import axios from 'axios';
// import puppeteer from 'puppeteer';
import { chromium } from 'playwright';

class UrlService {
    public async testUrl(url: string): Promise<boolean> {
        try {
            const response = await axios.head(url, {
                timeout: 5000, // Set a timeout of 5 seconds
                validateStatus: (status) => {
                    return status >= 200 && status < 400; // Accept only 2xx and 3xx status codes
                }
            })
            console.log(`Testing URL: ${url}, Status: ${response.status}`);
            return response.status >= 200 && response.status < 400;
        }
        catch (error) {
            console.error(`Error testing URL ${url}:`, error);
            return false;
        }
    }

    public findPatterns(url: string, patterns: string[]): boolean {
        //if the url contain any of the patterns return true
        for (const pattern of patterns) {
            if (url.toLocaleLowerCase().includes(pattern)) {
                return true;
            }
        }
        return false;
    }

    public async urlExtractor(url: string): Promise<string[]> {
        const browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'], 
        });
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        });
        const page = await context.newPage();

        try {
            console.log(`Launching browser for ${url}`);
            console.log(`Extracting URLs from ${url}`);
            page.setDefaultNavigationTimeout(10000);
            await page.goto(url, { waitUntil: 'networkidle' }); 
            const links = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('a')).map(link => link.href);
            });
            return links;
        } catch (error) {
            console.error(`Error extracting URLs from ${url}:`, error);
            return [];
        } finally {
            await browser.close();
        }
    }

    public async getProductUrls(url: string, hardCheck: boolean = false): Promise<string[]> {
        const links = await this.urlExtractor(url);
        // console.log(links, 'links');
        const patterns = ['/products/', '/items/', '/shop/', 'categories', '/p/', '/pd/', '/collections/', '/c/'];
        const filteredLinks = links.filter(link => this.findPatterns(link, patterns));
        // console.log(filteredLinks, 'filteredLinks');
        const productUrls: string[] = [];
        for (const link of filteredLinks) {
            if (hardCheck && await this.testUrl(link)) {
                productUrls.push(link);
            }
            else if(!hardCheck) {
                productUrls.push(link);
            }
        }
        return productUrls;
    }
}

export default new UrlService();