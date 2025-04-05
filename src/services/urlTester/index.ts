import axios from 'axios';
import puppeteer from 'puppeteer';

class UrlService {
    public async testUrl(url: string): Promise<boolean> {
        try {
            const response = await axios.head(url, {
                timeout: 5000, // Set a timeout of 5 seconds
                validateStatus: (status) => {
                    return status >= 200 && status < 400; // Accept only 2xx and 3xx status codes
                }
            })
            return response.status >= 200 && response.status < 400;
        }
        catch (error) {
            console.error(`Error testing URL ${url}:`, error);
            return false;
        }
    }

    public async findPatterns(url: string, patterns: string[]): Promise<boolean> {
        //if the url contain any of the patterns return true
        for (const pattern of patterns) {
            if (url.includes(pattern)) {
                return true;
            }
        }
        return false;
    }

    public async urlExtractor(url: string): Promise<string[]> {
        const domain = new URL(url).hostname;
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'].filter(Boolean),
        })
        try {
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3');
            page.setDefaultNavigationTimeout(10000);
            await page.goto(url, { waitUntil: 'networkidle2' });
            const links = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('a')).map((link) => link.href);
            })
            return links
        }
        catch (error) {
            console.error(`Error extracting URLs from ${url}:`, error);
            return [];
        }
        finally {
            await browser.close();
        }
    }

    public async getProductUrls(url: string): Promise<string[]> {
        const links = await this.urlExtractor(url);
        const patterns = ['product', 'item', 'detail', 'shop', 'category', 'p', 'pd'];
        const filteredLinks = links.filter(link => this.findPatterns(link, patterns));
        const productUrls: string[] = [];
        for (const link of filteredLinks) {
            if (await this.testUrl(link)) {
                productUrls.push(link);
            }
        }
        return productUrls;
    }
}

export default new UrlService();